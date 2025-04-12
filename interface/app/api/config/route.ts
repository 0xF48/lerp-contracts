import { CONFIG } from '@lerp/contracts';
import { NextResponse } from 'next/server';

export async function GET() {
	return NextResponse.json(CONFIG);
}