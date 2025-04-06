
import path from "path";

let CACHE: any = null

export async function getPublicLerpStatus(): Promise<{ error: any, status: any }> {

	try {
		const url = path.join(process.env.NEXT_PUBLIC_LERP_API_URL as string, '/status')

		const res = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
		});

		if (!res.ok) {
			throw new Error('Failed to fetch data');
		}
		const data = await res.json();
		CACHE = data
		return {
			error: null,
			status: data,
		}

	} catch (error) {
		console.error("Error fetching Lerp Status:", error);
		return {
			error: error,
			status: CACHE
		}
	}
}