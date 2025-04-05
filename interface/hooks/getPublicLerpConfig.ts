import { PublicConfig } from "@/enums";
import path from "path";
import { LOCAL_LERP_PUBLIC_CONFIG } from '@/constants'
export async function getPublicLerpConfig(): Promise<{ error: any, config: PublicConfig }> {
	let apiError = null
	const url = path.join(process.env.LERP_API_URL as string, '/config')

	try {

		const res = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
		});
		const remoteConfig = await res.json();
		if (JSON.stringify(remoteConfig) !== JSON.stringify(LOCAL_LERP_PUBLIC_CONFIG)) {
			apiError = new Error("Lerp Config does not match local config");
		}
	} catch (e) {
		apiError = e
	}


	// if (apiError) {
	// 	console.warn("API ERROR", apiError);
	// }


	return {
		error: apiError,
		config: LOCAL_LERP_PUBLIC_CONFIG,
	}
}