export function StatEntry({ label, children }: { label: string, children: any }) {
	return (
		<div className="flex justify-between items-center py-2">
			<span className="text-gray-600 text-sm">{label}:</span>
			<span className="text-black font-bold text-sm">{children}</span>
		</div>
	);
}
