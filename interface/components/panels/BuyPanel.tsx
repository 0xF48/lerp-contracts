'use client';




import cn from "classnames";
import { usePanel } from "@/hooks/usePanel";
import { PANEL } from "@/enums";


const showButtonPosition = `
	sticky left-0 bottom-10 
	max-w-[40em] w-full mt-10
`

const showButtonStyle = `
	bg-blue-500/90 text-white p-6 rounded-2xl
	backdrop-blur-3xl justify-between
	flex flex-row items-center
	ring-4
	
	ring-blue-500/10
	hover:ring-offset-4
	items-center
	justify-center

	cursor-pointer

	transition-all duration-300
	hover:scale-105
	hover:shadow-lg
`


export function BuyPanelContent() {

	return <div className={'w-full h-full bg-blue-500 text-white p-10'}>
		<div>buy options</div>
	</div>
}

export function BuyPanelButton() {
	const { navToPanel } = usePanel();

	return <div className={cn(showButtonPosition, showButtonStyle)} onClick={() => navToPanel(PANEL.BUY)}>
		<span className="font-bold">buy now</span>
	</div>
}