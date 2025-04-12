import { NextResponse } from 'next/server';
import { COMPUTE_COLLECTIONS, StakesComputeResult } from '@lerp/contracts';
import { useDB } from '@/hooks/useDB';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const accountAddress = searchParams.get('accountAddress');

	if (!accountAddress) {
		return NextResponse.json({ error: 'Account address is required' }, { status: 400 });
	}



	try {
		const db = useDB();
		const lastComputeResult = await db[COMPUTE_COLLECTIONS.StakesComputeResult].find().sort({ timestamp: -1 }).limit(1).toArray().then(res => res[0] as StakesComputeResult);

		if (!lastComputeResult?.data?.allStakers) {
			return NextResponse.json({ stakeInfo: null }, { status: 200 });
		}

		const stakeInfo = lastComputeResult.data.allStakers[accountAddress];
		return NextResponse.json({ stakeInfo: stakeInfo || null }, { status: 200 });
	} catch (error) {
		console.error("Error fetching account stake info:", error);
		return NextResponse.json({ error: 'Failed to fetch account stake info' }, { status: 500 });
	}
}