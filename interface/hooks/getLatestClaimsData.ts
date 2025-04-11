import { ClaimsStateEntry } from '@lerp/contracts';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.MONGO_DBNAME;
const COLLECTION_NAME = 'claimsData';


const client = new MongoClient(MONGO_URI, {
	serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

client.connect();
const db = client.db(DB_NAME);
const collection = db.collection<ClaimsStateEntry>(COLLECTION_NAME);


export async function getLatestClaimsData(): Promise<ClaimsStateEntry | null> {

	const latestState = await collection.findOne(
		{},
		{ sort: { timestamp: -1 } }
	);

	if (!latestState) {
		return null;
	}

	return latestState;

}