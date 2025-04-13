import cn from 'classnames';

export function Footer({ className }: { className?: string }) { // Accept className prop
	return <div className={cn(
		"relative text-black pt-20 min-h-[20em] flex flex-row justify-center", // Original classes
		className // Merge incoming className
	)}>
		<div>footer</div>
	</div>
}