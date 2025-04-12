import { MongoClient } from 'mongodb';
import { saveStakesData } from './saveStakesData';

const DB_URI = process.env.MONGO_URI as string
const client = new MongoClient(DB_URI)


export async function tick(tick_step: number) {


	if (tick_step === 0) {
		await saveStakesData({ client })
	}

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