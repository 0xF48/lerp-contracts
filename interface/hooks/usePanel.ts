'use client';

import { PANEL } from "@/enums";
import { useRouter, useSearchParams } from "next/navigation";

export function usePanel() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const currentPanel = searchParams.get('panel') || null;

	const navToPanel = (panelEnum: PANEL) => {
		console.log('navToPanel', panelEnum);
		const sp = new URLSearchParams(searchParams.toString());
		sp.set('panel', panelEnum);
		router.push(`?${sp.toString()}`, { scroll: false });
	};

	const hidePanel = () => {
		const sp = new URLSearchParams(searchParams.toString());
		sp.delete('panel');
		router.push(`?${sp.toString()}`, { scroll: false });
	};

	let panelOverlayColor = 'bg-black/90';
	if (currentPanel == PANEL.BUY) {
		panelOverlayColor = 'bg-[#000782]/90';
	} else if (currentPanel == PANEL.STAKE) {
		panelOverlayColor = 'bg-yellow-950/90';
	} else if (currentPanel == PANEL.CLAIM) {
		panelOverlayColor = 'bg-green-950/90';
	}

	let panelStyle = 'bg-gray-800'
	let panelTitleColor = 'bg-gray-800 text-white';
	if (currentPanel === PANEL.BUY) {
		panelStyle = 'bg-[blue] ';
		panelTitleColor = 'text-white';
	} else if (currentPanel === PANEL.STAKE) {
		panelStyle = 'bg-yellow-400';
		panelTitleColor = 'text-yellow-400';
	} else if (currentPanel === PANEL.CLAIM) {
		panelStyle = 'bg-white';
		panelTitleColor = 'bg-green-500 text-white';
	}

	return {
		currentPanel,
		panelOverlayColor,
		panelStyle,
		panelTitleColor,
		navToPanel,
		hidePanel,
	};
}