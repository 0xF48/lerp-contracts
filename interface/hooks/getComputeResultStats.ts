import { COMPUTE_COLLECTIONS } from "@lerp/contracts"
import { getLastComputeResult } from "./getLastComputeResult"
import { getLastComputeResults } from "./getLastComputeResults"


export type StatEntry = { // Added export
	name: string,
	description: string,
	value_str: string
}

export async function getComputeResultStats(): Promise<StatEntry[]> {
	const { stakesComputeResult, stakesHashPushResult, claimsComputeResult, claimsHashPushResult, airdropResult } = await getLastComputeResults()

	return [
		{
			name: 'Stakes Computed',
			description: 'The last time the $LFT stake transactions were processed from RPC. Compute results are used to generate merkel hashes for realm stake withdrawals.',
			value_str: stakesComputeResult ? new Date(stakesComputeResult.timestamp).toString() : 'never'
		},
		{
			name: 'Stakes Hash Pushed',
			description: 'The last time the merkel hash for the lerp founder contract on the mainnet was uploaded',
			value_str: stakesHashPushResult ? new Date(stakesHashPushResult.timestamp).toString() : 'never'
		},
		{
			name: 'Claims Computed',
			description: 'The last time the realm transactions were processed from RPC. Compute results are used to generate merkel hashes for withdrawals.',
			value_str: claimsComputeResult ? new Date(claimsComputeResult.timestamp).toString() : 'never'
		},
		{
			name: 'Claims Hash Pushed',
			description: 'The last time claim merkel hashes were pushed for all realms. These hashes are used to validate withdrawl amounts.',
			value_str: claimsHashPushResult ? new Date(claimsHashPushResult.timestamp).toString() : 'never'
		},
		{
			name: 'Rewards Airdrop',
			description: 'The last time eligible rewards were distributed via an airdrop. All claims must reach fixed amount before airdrop to conserve gas. You can still withdraw manually after hash has been updated.',
			value_str: airdropResult ? new Date(airdropResult.timestamp).toString() : 'never'
		}
	]
}