import { AirdropResult, ClaimsComputeResult, ClaimsPushHashResult, COMPUTE_COLLECTIONS, StakesComputeResult, StakesPushHashResult } from "@lerp/contracts"
import { useDB } from "./useDB"
import { getLastComputeResult } from "./getLastComputeResult"


export async function getLastComputeResults() {

	const [stakesComputeResult, claimsComputeResult, claimsHashPushResult, stakesHashPushResult, airdropResult] = await Promise.all([
		await getLastComputeResult<StakesComputeResult>(COMPUTE_COLLECTIONS.StakesComputeResult),
		await getLastComputeResult<ClaimsComputeResult>(COMPUTE_COLLECTIONS.ClaimsComputeResult),
		await getLastComputeResult<ClaimsPushHashResult>(COMPUTE_COLLECTIONS.ClaimsPushHashResult),
		await getLastComputeResult<StakesPushHashResult>(COMPUTE_COLLECTIONS.StakesPushHashResult),
		await getLastComputeResult<AirdropResult>(COMPUTE_COLLECTIONS.AirdropResult)
	])

	return {
		[COMPUTE_COLLECTIONS.StakesComputeResult]: stakesComputeResult,
		[COMPUTE_COLLECTIONS.ClaimsComputeResult]: claimsComputeResult,
		[COMPUTE_COLLECTIONS.ClaimsPushHashResult]: claimsHashPushResult,
		[COMPUTE_COLLECTIONS.StakesPushHashResult]: stakesHashPushResult,
		[COMPUTE_COLLECTIONS.AirdropResult]: airdropResult
	}
}