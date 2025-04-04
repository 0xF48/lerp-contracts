import path from "path"

export function getAPIAssetPath(assetPath: string): string {
	if (!assetPath) return ''
	if (assetPath.startsWith('http')) return assetPath
	if (assetPath.startsWith('/')) return path.join(process.env.LERP_API_URL as string, assetPath)
	return path.join(process.env.LERP_API_URL as string, '/assets', assetPath)
}