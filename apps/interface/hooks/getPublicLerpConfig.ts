import path from "path"; // Keep path for now, might need alternative later if run client-side
// Use @root alias to import from config directory at the project root
import { LOCAL_LERP_PUBLIC_CONFIG, PublicConfig } from '@root/config/GLOBAL_CONFIG';

export async function getPublicLerpConfig(): Promise<{ error: any, config: PublicConfig }> {
	let apiError = null
	// Ensure NEXT_PUBLIC_LERP_API_URL is set in your .env.local or environment
	const baseApiUrl = process.env.NEXT_PUBLIC_LERP_API_URL;
	if (!baseApiUrl) {
		console.warn("NEXT_PUBLIC_LERP_API_URL not set, using local config as fallback.");
		return { error: null, config: LOCAL_LERP_PUBLIC_CONFIG };
	}

	const url = `${baseApiUrl.replace(/\/$/, '')}/config`; // Use string concat instead of path.join

	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const config = await response.json();
		return { error: null, config };
	} catch (error) {
		console.error("Failed to fetch public config from API, using local fallback:", error);
		apiError = error;
		// Fallback to local config on error
		return { error: apiError, config: LOCAL_LERP_PUBLIC_CONFIG };
	}
}