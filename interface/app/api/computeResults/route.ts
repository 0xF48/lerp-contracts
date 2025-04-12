import { getLastComputeResults } from '@/hooks/getLastComputeResults';
import { NextResponse } from 'next/server';

export async function GET() {
	const data = await getLastComputeResults()
	if (!data) {
		return NextResponse.json({ error: 'latest claims data not available' }, { status: 404 })
		// throw new Error('latest claims data not available')
	}
	return NextResponse.json(data);
}