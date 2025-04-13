import classNames from "classnames";

export function StatEntry({ label, children }: { label: string, children: any }) {
	return (
		<div className="flex justify-between items-center">
			<span className="text-gray-600 text-sm">{label}:</span>
			<span className="text-black font-thin text-sm bg-gray-300 px-2 py-1 rounded-lg pb-1.5">{children}</span>
		</div>
	);
}

export function StatEntrySection({ label, children, className }: { label: any, children: any, className?: string }) {
	return <div className={classNames("w-full flex flex-col gap-4", className)} >
		<div className="w-full items-start text-gray-400" >
			<div>{label}</div>
		</div>
		<div className="w-full flex flex-col gap-2 px-4">
			{children}
		</div>

	</ div>
}