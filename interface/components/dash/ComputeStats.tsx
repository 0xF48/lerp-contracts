import { getComputeResultStats } from "@/hooks/getComputeResultStats";
import { StatEntry } from "./StatEntry";


export async function ComputeStats() {
	const stats = await getComputeResultStats()
	return <>
		{stats.map((entry) => {
			<StatEntry key={entry.name} label={entry.name}>
				{entry.value_str}
			</StatEntry>
		})}
	</>
}