import { AirdropResult, ClaimsComputeResult, ClaimsPushHashResult, COMPUTE_COLLECTIONS, StakesComputeResult, StakesPushHashResult } from "@lerp/contracts";
import { MongoClient, ServerApiVersion } from "mongodb";

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.MONGO_DBNAME;

const client = new MongoClient(MONGO_URI, {
	serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});
client.connect();

const db = client.db(DB_NAME)
const collections = {
	[COMPUTE_COLLECTIONS.ClaimsComputeResult]: db.collection<ClaimsComputeResult>(COMPUTE_COLLECTIONS.ClaimsComputeResult),
	[COMPUTE_COLLECTIONS.ClaimsPushHashResult]: db.collection<ClaimsPushHashResult>(COMPUTE_COLLECTIONS.ClaimsPushHashResult),
	[COMPUTE_COLLECTIONS.StakesComputeResult]: db.collection<StakesComputeResult>(COMPUTE_COLLECTIONS.StakesComputeResult),
	[COMPUTE_COLLECTIONS.StakesPushHashResult]: db.collection<StakesPushHashResult>(COMPUTE_COLLECTIONS.StakesPushHashResult),
	[COMPUTE_COLLECTIONS.AirdropResult]: db.collection<AirdropResult>(COMPUTE_COLLECTIONS.AirdropResult)
}

export function useDB() {
	return collections
}