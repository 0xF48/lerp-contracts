import { getPublicLerpStatus } from "@/hooks/getPublicLerpStatus";
import { StatEntry, StatEntrySection } from "./StatEntry";



export async function LerpNetworkStat() {
	const { error, status } = await getPublicLerpStatus();
	console.log(status)
	return <StatEntrySection label='Lerp Network'>
		{error && status && <div className="bg-red-500 text-white rounded-xl p-4">FAILED TO CONNECT TO LERP API, USING CACHE, {error.message}</div>}
		{error && !status && <div className="bg-red-500 text-white rounded-xl p-4">FAILED TO CONNECT TO LERP API, {error.message}</div>}
		{/* <SquareChart data={chartData} selectIndex={selectIndex} /> */}
		{!error && status && <>
			<StatEntry label="Client Version" >
				{status.version}
			</StatEntry>
			<StatEntry label="Nodes Online" >
				{status.globalMetrics.nodesCount.close}
			</StatEntry>
			<StatEntry label="Players Online" >
				{status.globalMetrics.clientsCount.close}
			</StatEntry>
			<StatEntry label="Worlds Online" >
				{status.globalMetrics.worldsCount.close}
			</StatEntry>
		</>


		}
	</StatEntrySection >
}