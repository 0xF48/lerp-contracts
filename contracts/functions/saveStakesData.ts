// contracts/functions/updateStakingDB.ts
import { MongoClient, UpdateResult } from 'mongodb';
import { computeStakesData } from './computeStakesData'; // Relative path
import { LERP_TOKEN_CONTRACT_ADDRESS, CONFIG, PublicConfig, StakesComputeResult, CONFIG_HASH, COMPUTE_COLLECTIONS } from '../index'; // Import config and address
import { Address } from 'viem';
import crypto from 'crypto'; // Import crypto module for hashing
import dotenv from 'dotenv'

dotenv.config({
	path: ".env", // Ensure this points to your .env file in the contracts directory
});

// --- Configuration ---
const MONGODB_URI = process.env.MONGO_URI as string;
const DB_NAME = process.env.MONGO_DBNAME as string;





// // --- Hardhat Local Config (Adjust if needed) ---
// const LOCAL_RPC_URL = 'http://127.0.0.1:8545/';
// // Use the address exported from index.ts, assuming it's kept up-to-date
// const LOCAL_LERP_TOKEN_ADDRESS: Address = LERP_TOKEN_CONTRACT_ADDRESS;
// const LOCAL_FROM_BLOCK = BigInt(0);



// compute the checksum
function computeChecksum(jsonObject: any): string {
	// Ensure consistent ordering for deterministic hash
	const jsonString = JSON.stringify(jsonObject, Object.keys(jsonObject).sort());
	const hash = crypto.createHash('sha256');
	hash.update(jsonString);
	return hash.digest('hex');
}

// --- Main Function ---
export async function saveStakesData({ client }: { client: MongoClient }) {
	console.log('Starting database update...');
	// const client = new MongoClient(MONGODB_URI);

	try {
		// 1. Compute latest staking data
		console.log(`Computing staking data from ${process.env.RPC_URL}...`);
		const stakeData = await computeStakesData();
		console.log('Staking data computed successfully.');
		console.log('Merkle Root:', stakeData.globalStakerMerkleRoot);

		const _id = computeChecksum(stakeData)

		// 2. Connect to MongoDB
		console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);

		const db = client.db(DB_NAME);
		// Get a typed collection reference
		const collection = db.collection<StakesComputeResult>(COMPUTE_COLLECTIONS.StakesComputeResult);
		console.log(`Connected to database '${DB_NAME}', collection '${COMPUTE_COLLECTIONS.StakesComputeResult}'.`);

		// Ensure an index exists on the timestamp field for efficient querying
		console.log("Ensuring index on 'timestamp' field...");
		await collection.createIndex({ timestamp: 1 }); // 1 for ascending order
		console.log("Index on 'timestamp' ensured.");

		// 3. Prepare the document to be saved
		// Combine static config with dynamic staking data
		const doc: StakesComputeResult = {
			_id: _id, // Fixed ID for upsert
			timestamp: new Date(),
			data: stakeData,
			configHash: CONFIG_HASH
		};

		// 4. Upsert the document into the collection
		console.log(`Updating document with ID '${_id}'...`);
		const result: UpdateResult = await collection.updateOne(
			{ _id: _id },
			{ $set: doc },
			{ upsert: true } // Create the document if it doesn't exist, update if it does
		);

		if (result.upsertedCount > 0) {
			console.log('Successfully inserted new staking state document.');
		} else if (result.modifiedCount > 0) {
			console.log('Successfully updated existing staking state document.');
		} else {
			console.log('Staking state document was already up-to-date.');
		}

	} catch (error) {
		console.error('Error updating database:', error);
		process.exit(1); // Exit with error code
	} finally {
		// Ensure the client will close when finish/error
		await client.close();
		console.log('MongoDB connection closed.');
	}
}

