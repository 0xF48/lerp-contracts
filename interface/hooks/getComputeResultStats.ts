import { StatEntry } from "@/enums"
import { getLastComputeResults } from "./getLastComputeResults"
import { formatDistanceToNow } from 'date-fns'

export async function getComputeResultStats(): Promise<StatEntry[]> {
	const { StakesComputeResult, StakesPushHashResult, ClaimsComputeResult, ClaimsPushHashResult, AirdropResult } = await getLastComputeResults()

	return [
		{
			name: 'Stakes Computed',
			description: 'The last time the $LFT stake transactions were processed from RPC. Compute results are used to generate merkel hashes for realm stake withdrawals.',
			value_str: StakesComputeResult ? formatDistanceToNow(new Date(StakesComputeResult.timestamp), { addSuffix: true }) : 'never'
		},
		{
			name: 'Stakes Hash Pushed',
			description: 'The last time the merkel hash for the lerp founder contract on the mainnet was uploaded',
			value_str: StakesPushHashResult ? new Date(StakesPushHashResult.timestamp).toString() : 'never'
		},
		{
			name: 'Claims Computed',
			description: 'The last time the realm transactions were processed from RPC. Compute results are used to generate merkel hashes for withdrawals.',
			value_str: ClaimsComputeResult ? new Date(ClaimsComputeResult.timestamp).toString() : 'never'
		},
		{
			name: 'Claims Hash Pushed',
			description: 'The last time claim merkel hashes were pushed for all realms. These hashes are used to validate withdrawl amounts.',
			value_str: ClaimsPushHashResult ? new Date(ClaimsPushHashResult.timestamp).toString() : 'never'
		},
		{
			name: 'Claims Airdropped',
			description: 'The last time eligible rewards were distributed via an airdrop. All claims must reach fixed amount before airdrop to conserve gas. You can still withdraw manually after hash has been updated.',
			value_str: AirdropResult ? new Date(AirdropResult.timestamp).toString() : 'never'
		}
	]
}