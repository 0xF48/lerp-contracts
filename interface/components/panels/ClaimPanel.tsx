'use client';
import cn from "classnames";
import { usePanel } from "@/hooks/usePanel";
import { PANEL, STYLE } from "@/enums";



export function ClaimPanelContent() {

	return <div className={'w-full h-full bg-green-500 text-white p-10'}>
		<div>claim options</div>
	</div>
}

export function ClaimPanelButton() {
	const { navToPanel } = usePanel();

	return <button className={cn(STYLE.GREEN_BUTTON)} onClick={() => navToPanel(PANEL.CLAIM)}>
		connect to claim
	</button>
}