import crypto from 'node:crypto'; // Import crypto module for hashing
import dotenv from 'dotenv'

export function computeChecksum(jsonObject: any): string {
	// Ensure consistent ordering for deterministic hash
	const jsonString = JSON.stringify(jsonObject, Object.keys(jsonObject).sort());
	const hash = crypto.createHash('sha256');
	hash.update(jsonString);
	return hash.digest('hex');
}