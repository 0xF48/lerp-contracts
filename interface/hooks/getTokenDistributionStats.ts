import { getLatestClaimsData } from "./getLatestClaimsData"

export type StatEntry = { // Added export
	name: string,
	value: number,
	value_str: string
}

export async function getTokenDistributionStats(): Promise<StatEntry[]> {

	const claimData = await getLatestClaimsData()

	if (!claimData) {
		return []
	}


	return [
		{
			name: 'Total Supply',
			value: claimData.config.tokenInfo.totalSupply,
			value_str: (claimData.config.tokenInfo.totalSupply).toFixed(2)
		},
		{
			name: 'Total Distributed',
			value: claimData.claimsData.tokenStats.totalDistributedLFTApprox,
			value_str: claimData.claimsData.tokenStats.totalDistributedLFTApprox.toFixed(2),
		},
		{
			name: 'Total Staked',
			value: claimData.claimsData.tokenStats.totalStakedLFTApprox,
			value_str: claimData.claimsData.tokenStats.totalStakedLFTApprox.toFixed(2),
		}
	]

}