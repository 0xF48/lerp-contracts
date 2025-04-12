import { getLastComputeResults } from '@/hooks/getLastComputeResults';
import { LERP_TOKEN_ABI } from '@lerp/contracts';
import { NextResponse } from 'next/server';

export async function GET() {
	return NextResponse.json(LERP_TOKEN_ABI);
}