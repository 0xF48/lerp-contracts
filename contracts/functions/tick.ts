import { MongoClient } from 'mongodb';
import { saveStakesData } from './saveStakesData';
import { pushStakesHash } from './pushStakesHash';

import * as dotenv from "dotenv";

dotenv.config({
	path: ".env", // Ensure this points to your .env file in the contracts directory
});

const DB_URI = process.env.MONGO_URI as string
const client = new MongoClient(DB_URI)


export async function tick(tick_step: number) {

	// await saveStakesData({ client })
	await pushStakesHash({ client })

	process.exit(0)
	// if (tick_step === 0) {


	// }

	// compute the stakes data


	// const stakesDataHash = computeChecksum(data)


	// compute tick logic:
	/**
	 * compute tick every 30 seconds
	 * compute stakes data every tick
	 * if tick# is mod 10 (30 * 10 = every 300 seconds (every 5 minutes)) then compute claims.
	 * stakes get put into stake
	 */



}