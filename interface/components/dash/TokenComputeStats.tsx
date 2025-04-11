import { getPublicLerpStatus } from "@/hooks/getPublicLerpStatus";

function StatEntry({ label, children }: { label: string, children: any }) {
	return (
		<div className="flex justify-between items-center py-2">
			<span className="text-gray-600 text-sm">{label}:</span>
			<span className="text-black font-bold text-sm">{children}</span>
		</div>
	);
}

export async function TokenComputeStats() {
	const { error, status } = await getPublicLerpStatus();

	return <div className="w-full flex flex-col gap-4" >
		<div className="w-full items-start text-gray-400" >
			<div>Lerp Network </div>
		</div>
		{error && status && <div className="bg-red-500 text-white rounded-xl p-4">FAILED TO CONNECT TO LERP API, USING CACHE, {error.message}</div>}
		{error && !status && <div className="bg-red-500 text-white rounded-xl p-4">FAILED TO CONNECT TO LERP API, {error.message}</div>}
		{/* <SquareChart data={chartData} selectIndex={selectIndex} /> */}
		{!error && status && <div className="flex flex-col px-4" >
			<StatEntry label="Nodes Online" >
				0
			</StatEntry>
		</div>}
	</div>
}