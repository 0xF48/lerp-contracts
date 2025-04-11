'use client';

import cn from 'classnames';
import { usePanel } from '../../hooks/usePanel'; // Relative path
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PANEL, PANEL_TITLES } from '../../enums'; // Relative path
import { BuyPanelContent } from '../panels/BuyPanel';
import { StakePanelContent } from '../panels/StakePanel';
import { ClaimPanelContent } from '../panels/ClaimPanel';


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

	useEffect(() => {
		if (!currentPanel) return;
		const scrollY = window.scrollY;
		document.body.style.position = 'fixed';
		document.body.style.top = `-${scrollY}px`;
		document.body.style.width = '100%';
		if (document.body.scrollHeight > window.innerHeight) {
			document.body.style.paddingRight = '7px';
		}
		return () => {
			document.body.style.position = '';
			document.body.style.top = '';
			document.body.style.width = '';
			document.body.style.paddingRight = '';
			window.scrollTo(0, scrollY);
		};
	}, [currentPanel]);

	return <>
		<>
			{/* Background Overlay */}
			<div
				onClick={hidePanel}
				ref={ref}
				className={cn(
					currentPanel ? "opacity-100 pointer-events-auto " + panelOverlayColor : "opacity-0 pointer-events-none bg-white",
					`w-full h-full fixed left-0 top-0 transition-opacity duration-200 backdrop-blur-3xl z-40`,
				)}
			/>

			{/* Panel Container */}
			<motion.div
				key="panel-content"
				className={cn(`
							z-50 fixed left-1/2 top-1/2
							-translate-x-1/2 -translate-y-1/2
							max-w-[30em] w-full h-[40em] max-h-full
							rounded-2xl overflow-hidden
							transition-opacity duration-300
							origin-bottom
						`,
					panelBackgroundColor, // Apply background color here
					panelContent ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
				)}
				initial={{ scale: SCALE_START, y: Y_START }}
				animate={{ scale: !panelContent ? SCALE_START : 1, y: !panelContent ? Y_START : 0 }}
				transition={{ type: "spring", stiffness: STIFFNESS, damping: DAMPING }}
			// style={{ x: "-50%", y: "-50%" }}
			>
				{panelContent ? (<>
					{/* Absolutely Positioned Title */}
					<div className={cn(
						'absolute top-0 left-0 right-0 z-10', // Positioning & z-index
						'text-lg flex py-3 justify-center items-center', // Adjusted padding
						// Removed background/blur from title for simplicity
					)}>
						<div className={cn(panelTitleColor)}>
							{panelTitle}
						</div>
					</div>

					{/* Scrollable Content Area */}
					{/* Added padding-top. Removed background color here. */}
					<div className={cn(
						"h-full rounded-xl overflow-hidden overflow-x-hidden",
						"pt-14", // Adjust this padding based on title height
						// Removed panelBackgroundColor
					)}>
						<div className={"h-full overflow-y-scroll overflow-x-hidden rounded-xl px-4 pb-4"}> {/* Added horizontal/bottom padding */}
							{panelContent}
						</div>
					</div>
				</>
				) : null}
			</motion.div>
		</>
	</>
}