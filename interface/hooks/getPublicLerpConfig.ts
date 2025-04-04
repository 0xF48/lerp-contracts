import path from "path";

export async function getPublicLerpConfig() {
	const url = path.join(process.env.LERP_API_URL as string, '/config')
	console.log(url)
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

	return data
}