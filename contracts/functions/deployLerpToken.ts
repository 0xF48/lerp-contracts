import { formatDistanceToNow } from "date-fns";
import { ethers } from "hardhat"; // Corrected import

async function main() {
	const [deployer] = await ethers.getSigners();

	console.log("Deploying contracts with the account:", deployer.address);

	const tokenName = "Lerp Founder Token";
	const tokenSymbol = "LFT";

	// Deploy LerpToken
	const LerpTokenFactory = await ethers.getContractFactory("LerpToken");
	const lerpToken = await LerpTokenFactory.deploy(tokenName, tokenSymbol);
	await lerpToken.waitForDeployment(); // Use standard deployment waiting method

	const deployedAddress = await lerpToken.getAddress(); // Get deployed address

	console.log(`LerpToken (${tokenSymbol}) deployed to:`, deployedAddress);

	// Optional: Start an initial sale immediately after deployment
	// You might want to configure these values
	const initialSaleAmount = ethers.parseUnits("10000", 18); // Example: 10,000 LFT
	const initialSalePrice = ethers.parseEther("0.001"); // Example: 0.001 ETH per LFT (adjust based on decimals)
	const saleDuration = 7 * 24 * 60 * 60; // 7 days in seconds

	console.log(`Starting initial sale with ${ethers.formatUnits(initialSaleAmount, 18)} LFT...`);
	try {


		const tx = await lerpToken.startSale(initialSaleAmount, initialSalePrice, saleDuration);
		await tx.wait();
		console.log("Initial sale started successfully.");
		console.log(` - Amount: ${ethers.formatUnits(await lerpToken.saleAvailableTokens(), 18)} LFT`);
		console.log(` - Price: ${ethers.formatEther(await lerpToken.saleTokenPrice())} ETH per LFT`);
		console.log(` - Duration: ${formatDistanceToNow(new Date(Number(await lerpToken.saleEndTime())))} days`);
	} catch (error) {
		console.error("Failed to start initial sale:", error);
	}

}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});