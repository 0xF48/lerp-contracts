'use client';

import cn from 'classnames';
import { usePanel } from '@/hooks/usePanel';
import { useEffect, useRef, useState } from 'react';
import { PANEL } from '@/enums';
import { BuyPanelContent } from './panels/BuyPanel';
import { StakePanelContent } from './panels/StakePanel';
import { ClaimPanelContent } from './panels/ClaimPanel';

export function PanelOverlay() {
	const { currentPanel, hidePanel, panelOverlayColor } = usePanel();
	const ref = useRef<HTMLDivElement>(null);
	let panelContent = null;
	if (currentPanel) {
		if (currentPanel == PANEL.BUY) {
			panelContent = <BuyPanelContent />;
		} else if (currentPanel == PANEL.STAKE) {
			panelContent = <StakePanelContent />
		} else if (currentPanel == PANEL.CLAIM) {
			panelContent = <ClaimPanelContent />
		}
	}

	useEffect(() => {
		if (!currentPanel) return;

		// Capture the current scroll position
		const scrollY = window.scrollY;

		// Fix the body so it doesn't scroll
		document.body.style.position = 'fixed';
		document.body.style.top = `-${scrollY}px`;
		document.body.style.width = '100%';

		return () => {
			// Reset the styles on cleanup
			document.body.style.position = '';
			document.body.style.top = '';
			document.body.style.width = '';

			// Restore the scroll position
			window.scrollTo(0, scrollY);
		};
	}, [currentPanel]);

	return <>

		<div
			onClick={hidePanel}
			ref={ref}
			className={
				cn(currentPanel ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none', `w-full h-full fixed left-0 top-0 transition-opacity duration-200 backdrop-blur-3xl z-40`, panelOverlayColor)}>
		</div>

		{panelContent ? <div className="z-50 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[30em] w-full h-[40em] max-h-full rounded-2xl overflow-y-scroll overflow-x-hidden">
			{panelContent}
		</div> : null}


	</>
}