import { getComputeResultStats } from "@/hooks/getComputeResultStats";
import { StatEntry, StatEntrySection } from "./StatEntry";


export async function ComputeStats() {
	const stats = await getComputeResultStats()
	return <StatEntrySection label='Compute Timestamps'>
		{stats.map((entry) => {
			return <StatEntry key={entry.name} label={entry.name}>
				{entry.value_str}
			</StatEntry>
		})}
	</StatEntrySection>


}