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
			name: 'Claims Computed',
			description: 'The last time claims for each realm were computed.'
			value: claimData.claimsComputeResult,
			value_str: (claimData.config.tokenInfo.totalSupply).toFixed(2)
		},
		{
			name: 'Block Processed',
			value: claimData.claimsData.tokenStats.totalDistributedLFTApprox,
			value_str: claimData.claimsData.tokenStats.totalDistributedLFTApprox.toFixed(2),
		},
		{
			name: 'Merkel Hash Pushed',
			value: claimData.claimsData.tokenStats.totalStakedLFTApprox,
			value_str: claimData.claimsData.tokenStats.totalStakedLFTApprox.toFixed(2),
		},
		{
			name: 
		}
	]

}