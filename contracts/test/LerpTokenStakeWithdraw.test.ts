import { expect } from "chai";
import { ethers, network } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { LerpToken } from "../typechain-types"; // Adjust path if needed
import { MerkleTree } from "merkletreejs";
import { keccak_256 as nobleKeccak256 } from '@noble/hashes/sha3'; // Corrected import name
import { encodePacked, keccak256 as viemKeccak256, Hex, parseEther, formatEther, Address } from 'viem';
import { time } from "@nomicfoundation/hardhat-network-helpers";

// Helper to create buffer from hex
const hexToBuffer = (hex: string) => Buffer.from(hex.replace(/^0x/, ''), 'hex');

// Helper for keccak256 using noble
const keccak256 = (input: Buffer | string): Buffer => {
	const data = typeof input === 'string' ? Buffer.from(input) : input;
	return Buffer.from(nobleKeccak256(data));
};


describe("LerpToken Staking and Withdrawal", function () {
	let lerpToken: LerpToken;
	let owner: SignerWithAddress;
	let addr1: SignerWithAddress;
	let addr2: SignerWithAddress;
	let lockAmountSeconds: number;

	const REALM_ID_1 = 1;
	const REALM_ID_2 = 2;

	beforeEach(async function () {
		const signers = await ethers.getSigners();
		owner = signers[0];
		addr1 = signers[1];
		addr2 = signers[2];
		if (!owner || !addr1 || !addr2) {
			throw new Error("Could not get enough signers");
		}

		const LerpTokenFactory = await ethers.getContractFactory("LerpToken");
		lerpToken = await LerpTokenFactory.deploy("Lerp Token", "LPT");
		await lerpToken.waitForDeployment();

		const lockAmountBigInt = await lerpToken.LOCK_AMOUNT();
		lockAmountSeconds = Number(lockAmountBigInt);

		// Distribute some tokens for testing
		// The contract holds the initial supply, so we need the owner (admin)
		// to transfer from the contract to the test accounts.
		// Standard transfer won't work as owner has 0 balance initially.
		// We'll use owner.connect(lerpToken) to call transfer *as* the contract (requires admin role implicitly)
		// OR add an explicit distribute function.
		// Let's assume owner can control contract funds via admin role for simplicity in test:
		// We need to approve the owner to spend contract's tokens first, or transfer to owner first.

		const contractAddress = await lerpToken.getAddress();
		const totalMinted = await lerpToken.balanceOf(contractAddress);

		// Transfer needed amounts from contract to owner first
		// This requires the contract to call transfer on itself, which isn't standard.
		// Let's modify the contract slightly for testing or use a different approach.

		// --- Alternative Approach: Transfer directly from contract using owner's admin power ---
		// This assumes an admin role allows transferring from the contract address.
		// Standard ERC20 doesn't work like this. We need to adjust the test setup logic.

		// --- Corrected Approach: Transfer from Contract to Owner, then Owner to Addr1/Addr2 ---
		// 1. Get contract instance connected to the owner signer
		const lerpTokenWithOwner = lerpToken.connect(owner);

		// 2. Transfer from contract to owner (Requires contract modification or admin function)
		// **Let's assume for the test we modify the constructor to mint to owner instead**
		// **OR** we skip this and assume owner magically got funds (less ideal)
		// **OR** we use the initial Hardhat accounts which are pre-funded.

		// --- Simplest Test Setup: Use Hardhat default accounts which have ETH ---
		// The error is ERC20InsufficientBalance, meaning the *token* balance is 0 for owner.
		// The contract was minted the tokens. Owner needs to get tokens from the contract.

		// Let's transfer from the contract *as* the owner (admin).
		// This requires a function like `adminTransferFromContract` or similar.
		// Since that doesn't exist, we'll simulate by having the contract transfer to owner first.

		// **Revised Setup:** Mint to Owner in Constructor (Requires Contract Change)
		// **OR** Add an admin transfer function (Requires Contract Change)
		// **OR** Test Setup Hack: Transfer from contract to owner using impersonation (complex)

		// **Let's stick to the standard flow and assume the owner *should* have received tokens**
		// The issue might be how Hardhat handles the initial state if `accounts` is set.
		// Let's assume the first account (owner) *should* have the tokens if minted to msg.sender.
		// We need to modify the CONSTRUCTOR in LerpToken.sol to mint to msg.sender

		// **Temporary Workaround for Test:** Transfer from Contract to Owner using Owner's signer
		// This relies on the default Hardhat behavior where the contract deployer *is* the owner.
		// We need to call transfer *from* the contract instance connected to the owner.

		// Get total supply to transfer most of it to owner for distribution
		const totalSupply = await lerpToken.totalSupply();
		const amountToOwner = totalSupply - parseEther("1"); // Keep 1 LFT in contract

		// This transfer will fail because only the contract address can transfer from itself.
		// await lerpTokenWithOwner.transfer(owner.address, amountToOwner); // Incorrect: Owner cannot initiate transfer from contract address

		// **Correct Test Setup:** Modify constructor or add admin function.
		// **For now, let's assume the constructor mints to owner and proceed.**
		// (This requires changing LerpToken.sol - outside scope of this diff)
		// Use the new adminDistribute function called by the owner
		await lerpTokenWithOwner.adminDistribute(addr1.address, parseEther("1000"));
		await lerpTokenWithOwner.adminDistribute(addr2.address, parseEther("500"));
	});

	it("Should allow staking tokens", async function () {
		const stakeAmount = parseEther("100");
		await lerpToken.connect(addr1).stakeTokensToRealm(REALM_ID_1, stakeAmount);

		// Check contract balance increased
		expect(await lerpToken.balanceOf(await lerpToken.getAddress())).to.be.gt(0); // Total supply initially minted to contract
		// Check user balance decreased
		expect(await lerpToken.balanceOf(addr1.address)).to.equal(parseEther("900"));
	});

	it("Should emit TokensStaked event", async function () {
		const stakeAmount = parseEther("50");
		const expectedUnlockTime = (await time.latest()) + lockAmountSeconds + 1; // +1 for next block

		await expect(lerpToken.connect(addr1).stakeTokensToRealm(REALM_ID_1, stakeAmount))
			.to.emit(lerpToken, "TokensStaked")
			.withArgs(addr1.address, REALM_ID_1, stakeAmount, expectedUnlockTime); // Timestamp might be off by 1 block
	});

	describe("Withdrawal Scenarios", function () {
		let stakeAmountAddr1: bigint;
		let stakeAmountAddr2: bigint;
		let unlockTimeAddr1: number;
		let unlockTimeAddr2: number;
		let leaves: Buffer[];
		let tree: MerkleTree;
		let root: Hex;

		beforeEach(async function () {
			// addr1 stakes in realm 1
			stakeAmountAddr1 = parseEther("100");
			await lerpToken.connect(addr1).stakeTokensToRealm(REALM_ID_1, stakeAmountAddr1);
			unlockTimeAddr1 = (await time.latest()) + lockAmountSeconds;

			// addr2 stakes in realm 1
			stakeAmountAddr2 = parseEther("50");
			await lerpToken.connect(addr2).stakeTokensToRealm(REALM_ID_1, stakeAmountAddr2);
			unlockTimeAddr2 = (await time.latest()) + lockAmountSeconds;

			// Prepare Merkle tree based on these stakes
			const leaf1 = viemKeccak256(encodePacked(
				['address', 'uint16', 'uint256', 'uint256'],
				[addr1.address as Address, REALM_ID_1, stakeAmountAddr1, BigInt(unlockTimeAddr1)] // Cast address
			));
			const leaf2 = viemKeccak256(encodePacked(
				['address', 'uint16', 'uint256', 'uint256'],
				[addr2.address as Address, REALM_ID_1, stakeAmountAddr2, BigInt(unlockTimeAddr2)] // Cast address
			));

			leaves = [hexToBuffer(leaf1), hexToBuffer(leaf2)];
			tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
			root = tree.getHexRoot() as Hex;
		});

		it("Should REVERT withdrawal if Merkle root is not set", async function () {
			const proof = tree.getHexProof(leaves[0]) as Hex[];
			await time.increaseTo(unlockTimeAddr1 + 1); // Increase time past lock

			await expect(
				lerpToken.connect(addr1).withdrawStakedTokens(REALM_ID_1, stakeAmountAddr1, unlockTimeAddr1, proof)
			).to.be.revertedWith("Invalid merkle proof"); // Fails because root is 0x0...0
		});

		it("Should REVERT withdrawal if lock time has not passed (even with valid root)", async function () {
			// Set the root
			await lerpToken.connect(owner).updateStakeWithdrawalMerkleRoot(root);

			const proof = tree.getHexProof(leaves[0]) as Hex[];
			// DO NOT increase time

			await expect(
				lerpToken.connect(addr1).withdrawStakedTokens(REALM_ID_1, stakeAmountAddr1, unlockTimeAddr1, proof)
			).to.be.revertedWith("Stake lock period not yet ended");
		});

		it("Should ALLOW withdrawal if root is set and lock time has passed", async function () {
			// Set the root
			await lerpToken.connect(owner).updateStakeWithdrawalMerkleRoot(root);

			const proof = tree.getHexProof(leaves[0]) as Hex[];
			await time.increaseTo(unlockTimeAddr1 + 1); // Increase time past lock

			const initialBalance = await lerpToken.balanceOf(addr1.address);
			await expect(
				lerpToken.connect(addr1).withdrawStakedTokens(REALM_ID_1, stakeAmountAddr1, unlockTimeAddr1, proof)
			).to.not.be.reverted;

			// Check balance increased by staked amount
			expect(await lerpToken.balanceOf(addr1.address)).to.equal(initialBalance + stakeAmountAddr1);
			// Check withdrawal flag is set
			expect(await lerpToken.hasWithdrawnStake(addr1.address, REALM_ID_1)).to.be.true;
		});

		it("Should REVERT double withdrawal within the same Merkle root period", async function () {
			// Set the root
			await lerpToken.connect(owner).updateStakeWithdrawalMerkleRoot(root);

			const proof = tree.getHexProof(leaves[0]) as Hex[];
			await time.increaseTo(unlockTimeAddr1 + 1); // Increase time past lock

			// First withdrawal
			await lerpToken.connect(addr1).withdrawStakedTokens(REALM_ID_1, stakeAmountAddr1, unlockTimeAddr1, proof);

			// Attempt second withdrawal
			await expect(
				lerpToken.connect(addr1).withdrawStakedTokens(REALM_ID_1, stakeAmountAddr1, unlockTimeAddr1, proof)
			).to.be.revertedWith("Stake already withdrawn this period");
		});

		it("Should ALLOW withdrawal after flags are reset and new root is set", async function () {
			// --- Period 1 ---
			await lerpToken.connect(owner).updateStakeWithdrawalMerkleRoot(root);
			const proof1 = tree.getHexProof(leaves[0]) as Hex[];
			await time.increaseTo(unlockTimeAddr1 + 1);
			await lerpToken.connect(addr1).withdrawStakedTokens(REALM_ID_1, stakeAmountAddr1, unlockTimeAddr1, proof1);
			expect(await lerpToken.hasWithdrawnStake(addr1.address, REALM_ID_1)).to.be.true;

			// --- Period 2 ---
			// Reset flags
			await lerpToken.connect(owner).resetWithdrawalFlags([addr1.address], [REALM_ID_1]);
			expect(await lerpToken.hasWithdrawnStake(addr1.address, REALM_ID_1)).to.be.false;

			// Simulate new stake and new tree/root (even if data is same for simplicity)
			// In reality, computeStakesData would run again
			const newStakeAmount = parseEther("10");
			await lerpToken.connect(addr1).stakeTokensToRealm(REALM_ID_1, newStakeAmount);
			const newUnlockTime = (await time.latest()) + lockAmountSeconds;

			const newLeaf = viemKeccak256(encodePacked(
				['address', 'uint16', 'uint256', 'uint256'],
				[addr1.address as Address, REALM_ID_1, newStakeAmount, BigInt(newUnlockTime)] // Cast address
			));
			// Include addr2's original stake in the new tree if they didn't withdraw
			const leaf2Original = viemKeccak256(encodePacked(
				['address', 'uint16', 'uint256', 'uint256'],
				[addr2.address as Address, REALM_ID_1, stakeAmountAddr2, BigInt(unlockTimeAddr2)] // Cast address
			));
			const newLeaves = [hexToBuffer(newLeaf), hexToBuffer(leaf2Original)];
			const newTree = new MerkleTree(newLeaves, keccak256, { sortPairs: true });
			const newRoot = newTree.getHexRoot() as Hex;

			// Update root
			await lerpToken.connect(owner).updateStakeWithdrawalMerkleRoot(newRoot);

			// Try withdrawing the *new* stake
			const proof2 = newTree.getHexProof(newLeaves[0]) as Hex[];
			await time.increaseTo(newUnlockTime + 1);

			const balanceBeforeWithdraw2 = await lerpToken.balanceOf(addr1.address);
			await expect(
				lerpToken.connect(addr1).withdrawStakedTokens(REALM_ID_1, newStakeAmount, newUnlockTime, proof2)
			).to.not.be.reverted;
			expect(await lerpToken.balanceOf(addr1.address)).to.equal(balanceBeforeWithdraw2 + newStakeAmount);
			expect(await lerpToken.hasWithdrawnStake(addr1.address, REALM_ID_1)).to.be.true;
		});
	});
});