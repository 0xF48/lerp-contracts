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
	claimsComputeResult: db.collection<ClaimsComputeResult>(COMPUTE_COLLECTIONS.ClaimsComputeResult),
	claimsHashPushResult: db.collection<ClaimsPushHashResult>(COMPUTE_COLLECTIONS.ClaimsPushHashResult),
	stakesComputeResult: db.collection<StakesComputeResult>(COMPUTE_COLLECTIONS.StakesComputeResult),
	stakesHashPushResult: db.collection<StakesPushHashResult>(COMPUTE_COLLECTIONS.StakesPushHashResult),
	airdropResult: db.collection<AirdropResult>(COMPUTE_COLLECTIONS.AirdropResult)
}

export function useDB() {
	return collections
}