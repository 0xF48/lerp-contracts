'use client';
import cn from "classnames";
import { usePanel } from "@/hooks/usePanel";
import { PANEL, STYLE } from "@/enums";



export function StakePanelContent() {

	return <div className={'w-full h-full bg-yellow-500 text-black p-10'}>
		<div>buy options</div>
	</div>
}

export function StakePanelButton() {
	const { navToPanel } = usePanel();

	return <button className={cn(STYLE.YELLOW_BUTTON)} onClick={() => navToPanel(PANEL.STAKE)}>
		stake
	</button>
}