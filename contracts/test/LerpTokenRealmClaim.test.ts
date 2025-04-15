import { expect } from "chai";
import { ethers, network } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { LerpToken, LerpRealm } from "../typechain-types";
import type { PodRunRealm as PodRunRealmType } from "../typechain-types"; // Import type for casting
// Removed duplicate import
import { MerkleTree } from "merkletreejs";
import { keccak_256 as nobleKeccak256 } from '@noble/hashes/sha3';
import { encodePacked, keccak256 as viemKeccak256, Hex, parseEther, formatEther, Address, parseUnits } from 'viem';
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { CONFIG } from ".."; // Import config for addresses

// Helper to create buffer from hex
const hexToBuffer = (hex: string) => Buffer.from(hex.replace(/^0x/, ''), 'hex');

// Helper for keccak256 using noble
const keccak256 = (input: Buffer | string): Buffer => {
	const data = typeof input === 'string' ? Buffer.from(input) : input;
	return Buffer.from(nobleKeccak256(data));
};


describe("LerpToken Realm Claim Flow", function () {
	let lerpToken: LerpToken;
	let podRunRealm: PodRunRealmType; // Use specific type
	let owner: SignerWithAddress; // Deploys contracts, acts as admin
	let staker1: SignerWithAddress; // Stakes LFT
	let player1: SignerWithAddress; // Mints pod, generates revenue
	let lockAmountSeconds: number;

	const REALM_ID = 1; // Corresponds to PodRunRealm stakeRealmId in config
	const POD_TOKEN_ID = 1; // From PodRunRealm contract
	const POD_TOKEN_PRICE = parseEther("0.01"); // From PodRunRealm contract
	const REVENUE_SHARE_PERCENT = 80; // From PodRunRealm contract

	beforeEach(async function () {
		[owner, staker1, player1] = await ethers.getSigners();

		// Deploy LerpToken
		const LerpTokenFactory = await ethers.getContractFactory("LerpToken", owner);
		lerpToken = await LerpTokenFactory.deploy("Lerp Token", "LPT");
		await lerpToken.waitForDeployment();
		const lerpTokenAddress = await lerpToken.getAddress();

		// Deploy PodRunRealm
		// Use ethers.deployContract helper for deployment within Hardhat tests
		podRunRealm = await ethers.deployContract(
			"PodRunRealm", // Contract name
			["test://metadata/"], // Constructor arguments in an array
			owner // Signer
		);
		await podRunRealm.waitForDeployment();
		const podRunRealmAddress = await podRunRealm.getAddress();

		// Distribute LFT from contract (using adminDistribute)
		await lerpToken.connect(owner).adminDistribute(staker1.address, parseEther("1000"));

		// Get lock amount
		const lockAmountBigInt = await lerpToken.LOCK_AMOUNT();
		lockAmountSeconds = Number(lockAmountBigInt);
	});

	it("Should allow claiming rewards after staking and revenue generation", async function () {
		// 1. Staker1 stakes LFT into PodRunRealm (ID 1)
		const stakeAmount = parseEther("100");
		await lerpToken.connect(staker1).stakeTokensToRealm(REALM_ID, stakeAmount);
		console.log(`Staker1 (${staker1.address}) staked ${formatEther(stakeAmount)} LFT`);

		// --- Off-Chain Simulation: Compute Stakes (Not tested here, assume done) ---
		// We need the stake data to calculate claim shares later.
		// In a real scenario, computeStakesData would run.
		// For the test, we know staker1 is the only staker with 100 LFT.

		// 2. Player1 generates revenue by minting a pod
		const initialRealmBalance = await ethers.provider.getBalance(await podRunRealm.getAddress());
		// Need to cast to specific type to call mintPod
		await expect(podRunRealm.connect(player1).mintPod({ value: POD_TOKEN_PRICE })) // No need to cast now
			.to.emit(podRunRealm, "RevenueGenerated")
			.withArgs(player1.address, (POD_TOKEN_PRICE * BigInt(REVENUE_SHARE_PERCENT)) / 100n, POD_TOKEN_PRICE);

		const finalRealmBalance = await ethers.provider.getBalance(await podRunRealm.getAddress());
		expect(finalRealmBalance).to.equal(initialRealmBalance + POD_TOKEN_PRICE);
		console.log(`Player1 (${player1.address}) minted pod, generated ${formatEther(POD_TOKEN_PRICE)} revenue`);

		// --- Off-Chain Simulation: Compute Claims ---
		// Based on the RevenueGenerated event and stake data:
		// Total Revenue = 0.01 ETH
		// Distributable Revenue = 0.01 * 80 / 100 = 0.008 ETH
		// Staker1 Stake = 100 LFT
		// Total Stake in Realm = 100 LFT (only staker1)
		// Staker1 Share = 100 / 100 = 100%
		// Staker1 Claim Amount = 0.008 ETH * 100% = 0.008 ETH
		const claimAmount = (POD_TOKEN_PRICE * BigInt(REVENUE_SHARE_PERCENT)) / 100n;

		// Construct Merkle Tree for claims
		const leaf = viemKeccak256(encodePacked(
			['address', 'uint256'],
			[staker1.address as Address, claimAmount]
		));
		const leaves = [hexToBuffer(leaf)];
		const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
		const root = tree.getHexRoot() as Hex;
		const proof = tree.getHexProof(leaves[0]) as Hex[];
		console.log(`Calculated Claim Merkle Root: ${root}`);
		console.log(`Staker1 Claim Amount: ${formatEther(claimAmount)} ETH`);

		// 3. Push Claims Merkle Root (Admin action)
		await expect(podRunRealm.connect(owner).updateClaimsMerkleRoot(root))
			.to.emit(podRunRealm, "ClaimsMerkleRootUpdated")
			.withArgs(root);
		expect(await podRunRealm.claimsMerkleRoot()).to.equal(root);
		console.log(`Admin pushed claims Merkle root.`);

		// 4. Staker1 withdraws rewards
		const initialStakerBalance = await ethers.provider.getBalance(staker1.address);

		// Estimate gas for withdrawal (optional, good practice)
		const withdrawTxResponse = await podRunRealm.connect(staker1).withdrawRewards(claimAmount, proof);
		const receipt = await withdrawTxResponse.wait();
		const gasUsed = receipt?.gasUsed ?? 0n;
		// Use effectiveGasPrice if available (post-EIP-1559), otherwise fall back to gasPrice
		const gasPrice = receipt?.gasPrice ?? 0n;
		const txFee = gasUsed * gasPrice;

		const finalStakerBalance = await ethers.provider.getBalance(staker1.address);

		// Check balance increased correctly (initial + claim - gas fee) - ensure all are bigint
		expect(finalStakerBalance).to.equal(initialStakerBalance + claimAmount - txFee); // Arithmetic should be fine with bigints
		console.log(`Staker1 withdrew ${formatEther(claimAmount)} ETH (Tx Fee: ${formatEther(txFee)} ETH)`);

		// Check claim flag
		expect(await podRunRealm.hasClaimed(staker1.address)).to.be.true;

		// 5. Attempt double withdrawal (should fail)
		await expect(
			podRunRealm.connect(staker1).withdrawRewards(claimAmount, proof)
		).to.be.revertedWith("LerpRealm: Rewards already claimed for this period");
		console.log(`Double withdrawal attempt reverted as expected.`);
	});

	// Separate tests for different invalid proof scenarios
	describe("Invalid Proof Scenarios", function () {
		let claimAmount: bigint;
		let root: Hex;
		let leaf: Hex;
		let tree: MerkleTree;

		beforeEach(async function () {
			// Generate revenue and set the root
			await podRunRealm.connect(player1).mintPod({ value: POD_TOKEN_PRICE });
			claimAmount = (POD_TOKEN_PRICE * BigInt(REVENUE_SHARE_PERCENT)) / 100n;
			leaf = viemKeccak256(encodePacked(['address', 'uint256'], [staker1.address as Address, claimAmount]));
			tree = new MerkleTree([hexToBuffer(leaf)], keccak256, { sortPairs: true });
			root = tree.getHexRoot() as Hex;
			await podRunRealm.connect(owner).updateClaimsMerkleRoot(root);
		});

		it("Should REVERT withdrawal with an empty proof array", async function () {
			const emptyProof: Hex[] = [];
			// Using revertedWithCustomError might be more specific if MerkleProof library uses custom errors,
			// but revertedWith should catch the require statement's reason string. Let's stick with revertedWith for now.
			await expect(
				podRunRealm.connect(staker1).withdrawRewards(claimAmount, emptyProof)
			).to.be.revertedWith("LerpRealm: Invalid Merkle proof");
		});

		it("Should REVERT withdrawal with a proof for a different leaf", async function () {
			const wrongLeaf = viemKeccak256(encodePacked(['address', 'uint256'], [owner.address as Address, claimAmount])); // Leaf for owner
			const wrongTree = new MerkleTree([hexToBuffer(wrongLeaf)], keccak256, { sortPairs: true }); // Tree for wrong leaf
			const proofForWrongLeaf = wrongTree.getHexProof(hexToBuffer(wrongLeaf)) as Hex[]; // Proof for wrong leaf

			// Note: This proof is technically valid for the wrongTree, but should fail against the root set on the contract (from the correct tree)
			await expect(
				podRunRealm.connect(staker1).withdrawRewards(claimAmount, proofForWrongLeaf)
			).to.be.revertedWith("LerpRealm: Invalid Merkle proof");
		});
	});

	it("Should REVERT withdrawal if root hasn't been set", async function () {
		// Generate revenue
		await podRunRealm.connect(player1).mintPod({ value: POD_TOKEN_PRICE }); // No need to cast now
		const claimAmount = (POD_TOKEN_PRICE * BigInt(REVENUE_SHARE_PERCENT)) / 100n;

		// Construct proof, but DON'T set the root on the contract
		const leaf = viemKeccak256(encodePacked(['address', 'uint256'], [staker1.address as Address, claimAmount]));
		const tree = new MerkleTree([hexToBuffer(leaf)], keccak256, { sortPairs: true });
		// const proof = tree.getHexProof(leaves[0]) as Hex[]; // Correctly removed reference to outer scope 'leaves'

		// Correct proof generation for single leaf tree
		const correctProof = tree.getHexProof(hexToBuffer(leaf)) as Hex[];


		await expect(
			podRunRealm.connect(staker1).withdrawRewards(claimAmount, correctProof)
		).to.be.revertedWith("LerpRealm: Invalid Merkle proof"); // Fails because root is 0x0...0
	});

});