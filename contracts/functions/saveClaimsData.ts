import { MongoClient, Db, Collection } from 'mongodb';
import { CONFIG, COMPUTE_COLLECTIONS, ClaimsComputeResult } from '..'; // Adjust path as needed

/**
 * Saves the computed claims data to the database.
 * @param dbClient MongoClient instance.
 * @param claimsData The computed claims data object (the 'data' part of ClaimsComputeResult).
 * @returns The MongoDB InsertOneResult or null if an error occurred.
 */
export async function saveClaimsData(
	dbClient: MongoClient,
	claimsData: ClaimsComputeResult['data'] // Expecting the data part
) {
	try {
		const db: Db = dbClient.db(process.env.MONGO_DBNAME || "lerp");
		const collection: Collection<ClaimsComputeResult> = db.collection(COMPUTE_COLLECTIONS.ClaimsComputeResult);

		const documentToInsert: Omit<ClaimsComputeResult, '_id'> = {
			configChecksum: CONFIG.checksum, // Use current config checksum
			timestamp: new Date(),
			data: claimsData // Embed the provided claims data
		};

		const result = await collection.insertOne(documentToInsert as ClaimsComputeResult);
		console.log(`Saved computed claims data to DB. Inserted ID: ${result.insertedId}`);
		return result;
	} catch (error) {
		console.error("Error saving computed claims data:", error);
		return null; // Indicate failure
	}
}