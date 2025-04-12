import { COMPUTE_COLLECTIONS, CONFIG, StakesComputeResult } from "@lerp/contracts"
import { getLastComputeResult } from "./getLastComputeResult"
import { StatEntry } from "@/enums"




export async function getTokenDistributionStats(): Promise<StatEntry[]> {

	const res = await getLastComputeResult<StakesComputeResult>(COMPUTE_COLLECTIONS.StakesComputeResult)

	if (!res) {
		return []
	}


	return [
		{
			name: 'Fixed Total Supply',
			value: CONFIG.tokenInfo.totalSupply,
			value_str: (CONFIG.tokenInfo.totalSupply).toFixed(2)
		},
		{
			name: 'Total Distributed',
			value: res.data.tokenStats.totalDistributedLFTApprox,
			value_str: res.data.tokenStats.totalDistributedLFTApprox.toFixed(2),
		},
		{
			name: 'Total Staked',
			value: res.data.tokenStats.totalStakedLFTApprox,
			value_str: res.data.tokenStats.totalStakedLFTApprox.toFixed(2),
		},
		{
			name: 'Fixed Stake Lock',
			value: CONFIG.tokenInfo.stakeLockDaysAmount,
			value_str: (CONFIG.tokenInfo.stakeLockDaysAmount) + ' days'
		},
	]

}