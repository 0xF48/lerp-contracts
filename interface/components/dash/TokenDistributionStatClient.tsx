// interface/components/dash/TokenDistributionStatClient.tsx
"use client"; // Mark as a Client Component

import { useState } from "react";
import { SquareChart } from "../util/SquareChart";
import { StatEntry } from "@/hooks/getTokenDistributionStats"; // Use the exported StatEntry type

interface TokenDistributionStatClientProps {
	initialData: StatEntry[]; // Use the correct type name
}

export function TokenDistributionStatClient({ initialData }: TokenDistributionStatClientProps) {
	// State for interactivity (e.g., selected chart segment)
	const [selectIndex, setSelectIndex] = useState(-1);

	// Process data for chart and display (can be memoized if needed)
	const chartData = initialData.map((entry) => entry.value);
	const statEntries = initialData.map((entry) => (
		<div key={entry.name} className="flex flex-row w-full justify-between">
			<div>{entry.name}</div>
			<div>{entry.value_str}</div>
		</div>
	));

	// TODO: Implement interaction logic (e.g., onClick handlers for chart/list items to setSelectIndex)

	return (
		<div className="w-full flex flex-col gap-4">
			<div className="w-full items-start text-gray-400">
				<div>Token Distribution</div>
			</div>
			{/* Pass state and potentially state setters to SquareChart if it becomes interactive */}
			<SquareChart data={chartData} selectIndex={selectIndex} />
			<div className="flex flex-col px-4">
				{statEntries}
			</div>
		</div>
	);
}