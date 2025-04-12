import { getComputeResultStats } from "@/hooks/getComputeResultStats";
import { StatEntry, StatEntrySection } from "./StatEntry";
import Link from "next/link";
import { Code2Icon, FileJson } from "lucide-react";
import { STYLE } from "@/enums";
import classNames from "classnames";


export async function ComputeStats() {
	const stats = await getComputeResultStats()
	return <StatEntrySection label={<Link href={'/api/computeResults'} className={classNames(STYLE.LINK_BLACK_TEXT)}>$LFT Compute Results</Link>}>

		{stats.map((entry) => {
			return <StatEntry key={entry.name} label={entry.name}>
				{entry.value_str}
			</StatEntry>
		})}
	</StatEntrySection>


}