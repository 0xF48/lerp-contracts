import { MongoClient, Db, Collection, WithId } from 'mongodb';
import { COMPUTE_COLLECTIONS, ComputeResult } from '../..'; // Adjust path as needed

/**
 * Fetches the most recent document from a specified compute result collection.
 * @param dbClient MongoClient instance.
 * @param collectionName The name of the collection to query.
 * @returns The latest document (including _id) or null if not found or on error.
 */
export async function getLastDbResult<T extends ComputeResult>(
	dbClient: MongoClient,
	collectionName: COMPUTE_COLLECTIONS
): Promise<WithId<T> | null> {
	try {
		const db: Db = dbClient.db(process.env.MONGO_DBNAME || "lerp"); // Use env var or default DB name
		const collection: Collection<T> = db.collection(collectionName);
		const lastResult = await collection.find()
			.sort({ timestamp: -1 }) // Sort by timestamp descending
			.limit(1) // Get only the latest one
			.toArray();
		return lastResult.length > 0 ? lastResult[0] : null;
	} catch (dbError) {
		console.error(`Error fetching last result from ${collectionName}:`, dbError);
		return null; // Return null on error
	}
}