import { getLatestClaimsData } from '@/hooks/getLatestClaimsData';
import { NextResponse } from 'next/server';

export async function GET() {
	const data = await getLatestClaimsData()
	if (!data) {
		return NextResponse.json({ error: 'latest claims data not available' }, { status: 404 })
		// throw new Error('latest claims data not available')
	}
	return NextResponse.json(data);
}