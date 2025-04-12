import { TokenDistributionStat } from "./TokenDistributionStat";
import { TokenTopHoldersStat } from "./TokenTopHoldersStat";
import { LerpNetworkStat } from "./LerpNetworkStat";
import { ComputeStats } from "./ComputeStats";


export function DashGlobalStatSections() {
	return <>
		<LerpNetworkStat />
		<ComputeStats />
		<TokenDistributionStat />
		<TokenTopHoldersStat />
	</>
}