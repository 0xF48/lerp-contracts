import { ChartAreaIcon } from "lucide-react";

export function SquareChart({ data, selectIndex }: { selectIndex: number, data: any }) {
	return (
		<div className='w-full rounded-lg bg-gray-100 flex items-center justify-center h-32'>
			<ChartAreaIcon className="stroke-gray-300" />
		</div>
	)
}