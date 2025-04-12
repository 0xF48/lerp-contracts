import { getPublicLerpStatus } from "@/hooks/getPublicLerpStatus";
import { getTokenComputeStats } from "@/hooks/getTokenComputeStats";

function StatEntry({ label, children }: { label: string, children: any }) {
	return (
		<div className="flex justify-between items-center py-2">
			<span className="text-gray-600 text-sm">{label}:</span>
			<span className="text-black font-bold text-sm">{children}</span>
		</div>
	);
}

export async function TokenComputeStats() {
	const stats = await getTokenComputeStats()
	return <>
		{stats.map((entry) => {
			<StatEntry key={entry.name} label={entry.name}>
				{entry.value_str}
			</StatEntry>
		})}
	</>
}