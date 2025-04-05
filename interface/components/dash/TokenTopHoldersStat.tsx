'use client'

import { useTopHolderStats } from "@/hooks/useTopHolderStats"
import { SquareChart } from "../util/SquareChart"
import { useState } from "react"

export function TokenTopHoldersStat() {
	const [selectIndex, setSelectIndex] = useState(-1)

	const { isLoading, data } = useTopHolderStats()



	let chartData: number[] = []
	let holderEntries = null

	if (data) {
		chartData = data.map((entry) => {
			return entry.tokenAmount
		})
		holderEntries = data.map((entry, index) => {
			return <div key={index} className="flex flex-row w-full justify-between">
				<div>{entry.address}</div>
				<div>{entry.tokenAmount}</div>
			</div>
		})
	}

	return <div className="w-full flex flex-col gap-4">
		<div className="w-full items-start text-gray-400">
			<div>Top Holders</div>
		</div>
		<SquareChart data={chartData} selectIndex={selectIndex} />
		<div className="flex flex-col px-4">
			{holderEntries}
		</div>
	</div>
}