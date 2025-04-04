'use client';

import cn from 'classnames';
import { usePanel } from '@/hooks/usePanel';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PANEL, PANEL_TITLES } from '@/enums';
import { BuyPanelContent } from './panels/BuyPanel';
import { StakePanelContent } from './panels/StakePanel';
import { ClaimPanelContent } from './panels/ClaimPanel';


const Y_START = 100
const SCALE_START = 0.8
const STIFFNESS = 500
const DAMPING = 30

export function PanelOverlay() {
	const { currentPanel, hidePanel, panelOverlayColor, panelTitleColor, panelBackgroundColor } = usePanel();
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

	const panelTitle = PANEL_TITLES[currentPanel as PANEL] || "Panel";

	const bgColor = panelBackgroundColor;

	useEffect(() => {
		if (!currentPanel) return;

		// Capture the current scroll position
		const scrollY = window.scrollY;

		// Fix the body so it doesn't scroll
		document.body.style.position = 'fixed';
		document.body.style.top = `-${scrollY}px`;
		document.body.style.width = '100%';


		if (document.body.scrollHeight > window.innerHeight) {
			document.body.style.paddingRight = '7px';
		}

		return () => {
			// Reset the styles on cleanup
			document.body.style.position = '';
			document.body.style.top = '';
			document.body.style.width = '';
			document.body.style.paddingRight = '';

			// Restore the scroll position
			window.scrollTo(0, scrollY);
		};
	}, [currentPanel]);

	return <>

		<>
			<div
				onClick={hidePanel}
				ref={ref}
				className={cn(
					currentPanel ? "opacity-100 pointer-events-auto bg-gray-200/80" : "opacity-0 pointer-events-none bg-white/0",
					`w-full h-full fixed left-0 top-0 transition-opacity duration-200 backdrop-blur-3xl z-40`,

				)}
			/>


			<motion.div
				key="panel-content" // Add key for AnimatePresence
				className={cn(`
							z-50 fixed left-1/2 top-1/2
							-translate-x-1/2 -translate-y-1/2
							max-w-[30em] w-full h-[40em] max-h-full
							rounded-2xl overflow-hidden
							transition-opacity duration-300
							origin-bottom /* Set transform origin for scale */
						`, panelContent ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}
				initial={{ scale: SCALE_START, y: Y_START }} // Start scaled down, transparent, and moved down
				animate={{ scale: !panelContent ? SCALE_START : 1, y: !panelContent ? Y_START : 0 }} // Animate to full scale, opaque, and original position
				// exit={{ scale: 0.5, y: 100 }} // Animate out similarly

				transition={{ type: "spring", stiffness: STIFFNESS, damping: DAMPING }} // Elastic spring animation
				style={{ x: "0%", y: "0%" }} // Keep centering logic (applied after transform)
			>
				{/* Inner container for scrolling */}
				{panelContent ? (<>
					<div className={'text-lg flex py-5 justify-center items-center font-bold -mb-10'}>
						<div className={cn(panelTitleColor, 'p-2 px-10 rounded-full')}>
							{panelTitle}
						</div>
					</div>
					<div className={"h-full rounded-xl overflow-hidden overflow-x-hidden  pl-1 pr-3 py-3 " + bgColor}>
						<div className={"h-full overflow-y-scroll overflow-x-hidden  rounded-xl " + bgColor}>
							{panelContent}
						</div>
					</div>
				</>

				) : null}
			</motion.div>


		</>


	</>
}