export function AnimatedLerpLogo({ className }: { className?: string }) {
	return <img
		className={"w-16 aspect-square mt-3 " + className}
		src="/logo-shape.svg"
		alt="Lerp Logo"
	/>
}