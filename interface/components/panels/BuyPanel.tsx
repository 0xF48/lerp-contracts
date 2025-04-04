'use client';




import cn from "classnames";
import { usePanel } from "@/hooks/usePanel";
import { PANEL } from "@/enums";


const showButtonPosition = `
	sticky left-0 bottom-10 
	max-w-[30em] w-[90%] mt-10
`

const showButtonStyle = `
	bg-blue-500/90 text-white p-6 rounded-2xl
	z-40
	backdrop-blur-xl justify-between
	flex flex-row items-center
	ring-4
	
	ring-blue-500/10
	hover:ring-offset-4
	items-center
	justify-between
	px-10

	cursor-pointer

	transition-all duration-300
	hover:scale-105
	hover:shadow-lg
	
`


export function BuyPanelContent() {

	return <div className={'w-full h-full bg-blue-500 text-white p-10'}>
		<div>BUY options</div>
	</div>
}

export function BuyPanelButton() {
	const { navToPanel } = usePanel();

	return <div className={cn(showButtonPosition, showButtonStyle)} onClick={() => navToPanel(PANEL.BUY)}>
		<span className="text-blue-950">sale ends in <strong className="text-blue-950 font-bold text-lg">10 days</strong></span>
		<span className="font-bold text-lg">Swap Now</span>
	</div>
}