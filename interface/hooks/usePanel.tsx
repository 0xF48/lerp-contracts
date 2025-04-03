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

	let panelOverlayColor = 'bg-blue-700/90';
	if (currentPanel == PANEL.BUY) {
		panelOverlayColor = 'bg-blue-700/90';
	} else if (currentPanel == PANEL.STAKE) {
		panelOverlayColor = 'bg-yellow-700/90';
	} else if (currentPanel == PANEL.CLAIM) {
		panelOverlayColor = 'bg-green-700/90';
	}

	return {
		currentPanel,
		panelOverlayColor,
		navToPanel,
		hidePanel,
	};
}