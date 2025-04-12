import { getLatestClaimsData } from "./getLatestClaimsData"

export type StatEntry = { // Added export
	name: string,
	description: string,
	value_str: string
}

export async function getTokenComputeStats(): Promise<StatEntry[]> {

	const claimData = await getLatestClaimsData()

	if (!claimData) {
		return []
	}

	return [
		{
			name: 'Stakes Computed',
			description: 'The last time the $LFT stake transactions were processed from RPC. Compute results are used to generate merkel hashes for realm stake withdrawals.',
			value_str: new Date(claimData.stakesComputeResult?.timestamp).toString()
		},
		{
			name: 'Stakes Hash Pushed',
			description: 'The last time the merkel hash for the lerp founder contract on the mainnet was uploaded',
			value_str: new Date(claimData.stakesHashPushResult?.timestamp).toString()
		},
		{
			name: 'Claims Computed',
			description: 'The last time the realm transactions were processed from RPC. Compute results are used to generate merkel hashes for withdrawals.',
			value_str: new Date(claimData.claimsComputeResult?.timestamp).toString()
		},
		{
			name: 'Claims Hash Pushed',
			description: 'The last time claim merkel hashes were pushed for all realms. These hashes are used to validate withdrawl amounts.',
			value_str: new Date(claimData.claimsHashPushResult?.timestamp).toString()
		},
		{
			name: 'Rewards Airdrop',
			description: 'The last time eligible rewards were distributed via an airdrop. All claims must reach fixed amount before airdrop to conserve gas. You can still withdraw manually after hash has been updated.',
			value_str: new Date(claimData.airdropResult.timestamp).toString()
		}
	]
}