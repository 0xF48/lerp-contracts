import { TokenDistributionStat } from "./TokenDistributionStat";
import { TokenTopHoldersStat } from "./TokenTopHoldersStat";





export function DashTokenStatSections() {
	return <>
		<TokenDistributionStat />
		<TokenTopHoldersStat />
	</>
}