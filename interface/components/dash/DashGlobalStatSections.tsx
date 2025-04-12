
import { LerpNetworkStat } from "./LerpNetworkStat";
import { ComputeStats } from "./ComputeStats";
import { LerpGlobalConfigInfoStats } from "./LerpGlobalConfigInfoStats";
import { StakeComputeResultStats } from "./StakeComputeResultStats";


export function DashGlobalStatSections() {
	return <>
		<LerpNetworkStat />
		<ComputeStats />
		<LerpGlobalConfigInfoStats />
		<StakeComputeResultStats />
	</>
}