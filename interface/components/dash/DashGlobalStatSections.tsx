import { TokenDistributionStat } from "./TokenDistributionStat";
import { TokenTopHoldersStat } from "./TokenTopHoldersStat";
import { LerpNetworkStat } from "./LerpNetworkStat";


export function DashGlobalStatSections() {
	return <>
		<LerpNetworkStat />
		<TokenDistributionStat />
		<TokenTopHoldersStat />
	</>
}