'use client'

import { useTokenDistributionStats } from "@/hooks/useTokenDistributionStats";
import { SquareChart } from "./SquareChart";
import { useState } from "react";







export function TokenDistributionStat() {
	const { isLoading, data } = useTokenDistributionStats();
	const [selectIndex, setSelectIndex] = useState(-1)

	let chartData: number[] = [];
	let statEntries = null;

	if (data) {
		chartData = data.map((entry) => {
			return entry.value
		})
		statEntries = data.map((entry) => {
			return <div key={entry.name} className="flex flex-row w-full justify-between">
				<div>{entry.name}</div>
				<div>{entry.value_str}</div>
			</div>
		})
	}



	return (
		<div className="w-full flex flex-col gap-4">
			<div className="w-full items-start text-gray-400">
				<div>Token Distribution</div>
			</div>
			<SquareChart data={chartData} selectIndex={selectIndex} />
			<div className="flex flex-col px-4">
				{statEntries}
			</div>
		</div>
	)
}