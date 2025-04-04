import { ethers } from "hardhat"; // Reverted import
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { LerpToken } from "../typechain-types"; // Assuming TypeChain generated types

describe("LerpToken", function () {
	// We define a fixture to reuse the same setup in every test.
	async function deployLerpTokenFixture() {
		// Get signers
		const [owner, addr1, addr2] = await ethers.getSigners();

		// Deploy LerpToken contract
		const lerpTokenFactory = await ethers.getContractFactory("LerpToken");
		const lerpToken = await lerpTokenFactory.deploy("Lerp Token", "LRP");
		await lerpToken.waitForDeployment();
		const lerpTokenAddress = await lerpToken.getAddress();


		return { lerpToken, lerpTokenAddress, owner, addr1, addr2 };
	}

	describe("Deployment", function () {
		it("Should set the right owner", async function () {
			const { lerpToken, owner } = await loadFixture(deployLerpTokenFixture);
			expect(await lerpToken.hasRole(await lerpToken.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
		});

		it("Should mint the total supply to the contract itself", async function () {
			const { lerpToken, lerpTokenAddress } = await loadFixture(deployLerpTokenFixture);
			const contractBalance = await lerpToken.balanceOf(lerpTokenAddress);
			expect(contractBalance).to.equal(await lerpToken.TOTAL_SUPPLY());
		});
	});

	describe("Sales", function () {
		it("Should allow admin to start a sale", async function () {
			const { lerpToken, owner } = await loadFixture(deployLerpTokenFixture);
			const saleAmount = ethers.parseUnits("1000", 18); // 1000 tokens
			const salePrice = ethers.parseUnits("0.01", "ether"); // 0.01 ETH per token
			const duration = 3600; // 1 hour

			// Need to use the correct parameter name from the contract: setSaleAvailableTokens
			await expect(lerpToken.connect(owner).startSale(saleAmount, salePrice, duration))
				.to.not.be.reverted;

			expect(await lerpToken.saleAvailableTokens()).to.equal(saleAmount);
			expect(await lerpToken.saleTokenPrice()).to.equal(salePrice);
			// Check saleEndTime is roughly correct (within a small margin)
			const block = await ethers.provider.getBlock("latest");
			expect(await lerpToken.saleEndTime()).to.be.closeTo(block!.timestamp + duration, 5); // Allow 5s difference
		});

		it("Should allow users to buy tokens during a sale", async function () {
			const { lerpToken, owner, addr1 } = await loadFixture(deployLerpTokenFixture);
			const saleAmount = ethers.parseUnits("1000", 18);
			const salePrice = ethers.parseUnits("0.01", "ether");
			const duration = 3600;
			const buyAmount = ethers.parseUnits("100", 18); // Buy 100 tokens
			const cost = BigInt(buyAmount) * BigInt(salePrice) / BigInt(ethers.parseUnits("1", 18)); // Calculate cost in wei

			// Start sale first
			await lerpToken.connect(owner).startSale(saleAmount, salePrice, duration);

			// User buys tokens
			const lerpTokenAddress = await lerpToken.getAddress(); // Get address before expect
			const buyerAddress = addr1.address; // Get buyer address before expect
			await expect(lerpToken.connect(addr1).buyTokens(buyAmount, { value: cost }))
				.to.emit(lerpToken, "Transfer") // Transfer from contract to addr1
				.withArgs(lerpTokenAddress, buyerAddress, buyAmount); // Use variables here

			expect(await lerpToken.balanceOf(addr1.address)).to.equal(buyAmount);
			expect(await lerpToken.saleAvailableTokens()).to.equal(saleAmount - buyAmount);
		});

		it("Should fail if user sends insufficient funds", async function () {
			const { lerpToken, owner, addr1 } = await loadFixture(deployLerpTokenFixture);
			const saleAmount = ethers.parseUnits("1000", 18);
			const salePrice = ethers.parseUnits("0.01", "ether");
			const duration = 3600;
			const buyAmount = ethers.parseUnits("100", 18);
			const insufficientCost = BigInt(buyAmount) * BigInt(salePrice) / BigInt(ethers.parseUnits("1", 18)) - BigInt(1); // 1 wei less

			await lerpToken.connect(owner).startSale(saleAmount, salePrice, duration);

			await expect(lerpToken.connect(addr1).buyTokens(buyAmount, { value: insufficientCost }))
				.to.be.revertedWith("Insufficient funds sent");
		});

		it("Should fail if sale has ended", async function () {
			const { lerpToken, owner, addr1 } = await loadFixture(deployLerpTokenFixture);
			const saleAmount = ethers.parseUnits("1000", 18);
			const salePrice = ethers.parseUnits("0.01", "ether");
			const duration = 1; // 1 second duration

			await lerpToken.connect(owner).startSale(saleAmount, salePrice, duration);

			// Wait for sale to end
			await ethers.provider.send("evm_increaseTime", [duration + 1]);
			await ethers.provider.send("evm_mine");

			const buyAmount = ethers.parseUnits("100", 18);
			const cost = BigInt(buyAmount) * BigInt(salePrice) / BigInt(ethers.parseUnits("1", 18));

			await expect(lerpToken.connect(addr1).buyTokens(buyAmount, { value: cost }))
				.to.be.revertedWith("Sale has ended");
		});
	});

	describe("Staking", function () {
		it("Should allow users to stake tokens to a realm", async function () {
			const { lerpToken, lerpTokenAddress, owner, addr1 } = await loadFixture(deployLerpTokenFixture);
			const saleAmount = ethers.parseUnits("1000", 18);
			const salePrice = ethers.parseUnits("0.01", "ether");
			const duration = 3600;
			const buyAmount = ethers.parseUnits("100", 18);
			const stakeAmount = ethers.parseUnits("50", 18); // Stake 50 tokens
			const realmId = 1;
			const cost = BigInt(buyAmount) * BigInt(salePrice) / BigInt(ethers.parseUnits("1", 18));

			// Start sale and buy tokens first
			await lerpToken.connect(owner).startSale(saleAmount, salePrice, duration);
			await lerpToken.connect(addr1).buyTokens(buyAmount, { value: cost });

			// User stakes tokens
			const tx = await lerpToken.connect(addr1).stakeTokensToRealm(realmId, stakeAmount);
			const receipt = await tx.wait();
			const block = await ethers.provider.getBlock(receipt!.blockNumber);
			const expectedUnlockTime = block!.timestamp + Number(await lerpToken.LOCK_AMOUNT());

			await expect(tx)
				.to.emit(lerpToken, "TokensStaked")
				.withArgs(addr1.address, realmId, stakeAmount, (unlockTime: bigint) => {
					// Allow a small tolerance (e.g., 2 seconds) for timestamp check
					const tolerance = 2;
					expect(Number(unlockTime)).to.be.closeTo(expectedUnlockTime, tolerance);
					return true; // Indicate successful validation
				});

			// Check balances
			expect(await lerpToken.balanceOf(addr1.address)).to.equal(buyAmount - stakeAmount); // User balance decreases
			expect(await lerpToken.balanceOf(lerpTokenAddress)).to.equal(
				(await lerpToken.TOTAL_SUPPLY()) - saleAmount + (saleAmount - buyAmount) + stakeAmount // Contract balance increases by stake amount
			);
		});

		// Moved this test case out of the previous 'it' block and into the 'describe' block
		it("Should fail if user tries to buy tokens when no sale is active", async function () {
			const { lerpToken, addr1 } = await loadFixture(deployLerpTokenFixture);
			const buyAmount = ethers.parseUnits("100", 18);
			// Sending some value, although it doesn't matter much as it should revert before checking value
			const dummyCost = ethers.parseUnits("1", "ether");

			// Attempt to buy without starting a sale
			await expect(lerpToken.connect(addr1).buyTokens(buyAmount, { value: dummyCost }))
				.to.be.revertedWith("Sale has ended"); // Because saleEndTime is 0
		});

		it("Should fail if user tries to stake 0 tokens", async function () {
			const { lerpToken, addr1 } = await loadFixture(deployLerpTokenFixture);
			const realmId = 1;
			await expect(lerpToken.connect(addr1).stakeTokensToRealm(realmId, 0))
				.to.be.revertedWith("Cannot stake 0");
		});

		it("Should fail if user has insufficient balance to stake", async function () {
			const { lerpToken, addr1 } = await loadFixture(deployLerpTokenFixture);
			const stakeAmount = ethers.parseUnits("10", 18);
			const realmId = 1;

			// addr1 has 0 balance initially
			// Check only for revert, not specific reason string
			await expect(lerpToken.connect(addr1).stakeTokensToRealm(realmId, stakeAmount))
				.to.be.reverted;
		});
	});

	// Add tests for withdrawStakedTokens later when Merkle proof generation is implemented off-chain
	// Add tests for withdrawAllNativeCurrency and withdrawNativeCurrency
});
