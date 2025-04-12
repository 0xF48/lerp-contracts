import { useDB } from "./useDB";
import { COMPUTE_COLLECTIONS } from "@lerp/contracts";

export async function getLastComputeResult<T>(collectionName: COMPUTE_COLLECTIONS): Promise<T | null> {
	const result = await useDB()[collectionName].find().sort({ timestamp: -1 }).limit(1).toArray();
	if (result.length > 0) {
		return result[0] as T;
	} else {
		return null;
	}
}