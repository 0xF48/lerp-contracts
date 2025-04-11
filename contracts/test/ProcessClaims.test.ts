import { processClaims } from '@/functions/processClaims';
import { LERP_TOKEN_CONTRACT_ADDRESS, CONFIG, PublicRealmConfig } from '../index';


// Example Usage (Uncommented)
async function testCompute() {
	const rpc = 'http://127.0.0.1:8545'; // Your Hardhat node RPC
	const tokenAddr = LERP_TOKEN_CONTRACT_ADDRESS;
	const configData = CONFIG;

	try {
		const stakingData = await processClaims(rpc, configData, tokenAddr, undefined, { includeLeafData: true });
		console.log(JSON.stringify(stakingData, (key, value) =>
			typeof value === 'bigint' ? value.toString() : value, 2)); // Pretty print with bigint handling
	} catch (e) {
		console.error("Test failed:", e);
	}
}

testCompute(); // Uncommented call