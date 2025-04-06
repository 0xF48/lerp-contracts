// Removed: import path from "path"

export function getAPIAssetPath(assetPath: string | undefined | null): string {
	// Handle undefined/null input gracefully
	if (!assetPath) return '';

	// If it's already a full URL, return it directly
	if (assetPath.startsWith('http')) return assetPath;

	// Get the base API URL from the environment variable (must be prefixed with NEXT_PUBLIC_)
	const baseApiUrl = process.env.NEXT_PUBLIC_LERP_API_URL;

	// Handle missing environment variable
	if (!baseApiUrl) {
		console.error("Error: NEXT_PUBLIC_LERP_API_URL environment variable is not set.");
		// Return a placeholder or the original path, depending on desired behavior
		return assetPath; // Or return '/placeholder.png' or similar
	}

	// Ensure baseApiUrl doesn't have a trailing slash and assetPath has a leading slash
	const cleanBaseUrl = baseApiUrl.endsWith('/') ? baseApiUrl.slice(0, -1) : baseApiUrl;
	const cleanAssetPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;

	// Construct the full URL
	// Using simple string concatenation is often sufficient and avoids potential URL constructor issues
	return `${cleanBaseUrl}${cleanAssetPath}`;

	// --- Alternative using URL constructor (more robust but slightly more complex) ---
	// try {
	//   // Ensure assetPath doesn't start with '/' when using URL constructor relative path
	//   const relativeAssetPath = assetPath.startsWith('/') ? assetPath.substring(1) : assetPath;
	//   const fullUrl = new URL(relativeAssetPath, baseApiUrl);
	//   return fullUrl.href;
	// } catch (error) {
	//   console.error("Error constructing URL:", error);
	//   return assetPath; // Fallback on error
	// }
}