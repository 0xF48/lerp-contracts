'use client';




import cn from "classnames";
import { usePanel } from "@/hooks/usePanel";
import { PANEL } from "@/enums";
import { TapScaleWrapper } from "../TapScaleWrapper";


const showButtonPosition = `
	sticky z-20 left-0 bottom-10 
	max-w-[30em] w-[90%] mt-10
`

const showButtonStyle = `
	bg-blue-500/90 text-white p-6 rounded-2xl
	justify-between
	flex flex-row items-center	
	items-center
	justify-between
	px-10
	cursor-pointer
`


export function BuyPanelContent() {

	return <div className={'w-full h-full  text-white p-10'}>
		<div>BUY options</div>
	</div>
}

export function BuyPanelButton() {
	const { navToPanel } = usePanel();

	return <TapScaleWrapper className={cn(showButtonPosition)} onTap={() => navToPanel(PANEL.BUY)}>
		<div className={cn(showButtonStyle)}>
			<span className="text-blue-950">sale ends in <strong className="text-blue-950 font-bold text-lg">10 days</strong></span>
			<span className="font-bold text-lg">Swap Now</span>
		</div>
	</TapScaleWrapper>


}