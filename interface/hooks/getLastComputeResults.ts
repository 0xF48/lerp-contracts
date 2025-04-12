import { AirdropResult, ClaimsComputeResult, ClaimsPushHashResult, COMPUTE_COLLECTIONS, StakesComputeResult, StakesPushHashResult } from "@lerp/contracts"
import { useDB } from "./useDB"
import { getLastComputeResult } from "./getLastComputeResult"


export async function getLastComputeResults() {
	const collections = useDB()

	const [stakesComputeResult, claimsComputeResult, claimsHashPushResult, stakesHashPushResult, airdropResult] = await Promise.all([
		await getLastComputeResult<StakesComputeResult>(collections[COMPUTE_COLLECTIONS.StakesComputeResult]),
		await getLastComputeResult<ClaimsComputeResult>(collections[COMPUTE_COLLECTIONS.ClaimsComputeResult]),
		await getLastComputeResult<ClaimsPushHashResult>(collections[COMPUTE_COLLECTIONS.ClaimsPushHashResult]),
		await getLastComputeResult<StakesPushHashResult>(collections[COMPUTE_COLLECTIONS.StakesPushHashResult]),
		await getLastComputeResult<AirdropResult>(collections[COMPUTE_COLLECTIONS.AirdropResult])
	])

	return {
		stakesComputeResult,
		claimsComputeResult,
		claimsHashPushResult,
		stakesHashPushResult,
		airdropResult
	}
}