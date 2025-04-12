import { TokenDistributionStat } from "./TokenDistributionStat";
import { TokenTopHoldersStat } from "./TokenTopHoldersStat";
import { LerpNetworkStat } from "./LerpNetworkStat";
import { TokenComputeStats } from "./TokenComputeStats";


export function DashGlobalStatSections() {
	return <>
		<LerpNetworkStat />
		<TokenComputeStats />
		<TokenDistributionStat />
		<TokenTopHoldersStat />
	</>
}