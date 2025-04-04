'use client';

import React, { useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import cn from 'classnames';

interface TapScaleWrapperProps {
	children: React.ReactNode;
	className?: string; // Allow passing additional classes
	onTap?: () => void; // Optional tap handler
}

export const TapScaleWrapper: React.FC<TapScaleWrapperProps> = ({
	children,
	className,
	onTap
}) => {
	const controls = useAnimationControls();
	const [isTapped, setIsTapped] = useState(false);

	const handleTapStart = () => {
		console.log('Tapped');
		setIsTapped(true);
		controls.start({
			scale: 0.98,
			// Directly animate the CSS variable Tailwind uses for ring offset
			// @ts-ignore - Framer motion can animate CSS variables
			// '--tw-ring-offset-width': '4px',
		});
	};

	const handleTapEnd = () => {
		setIsTapped(false);
		controls.start({
			scale: 1,
			// @ts-ignore
			// '--tw-ring-offset-width': '0px',
		});
		// Call the optional onTap handler if provided
		if (onTap) {
			onTap();
		}
	};

	const handleTapCancel = () => {
		setIsTapped(false);
		controls.start({
			scale: 1,
			// @ts-ignore
			'--tw-ring-offset-width': '0px',
		});
	}

	return (
		<div className={className}>
			<motion.div
				className={cn(
					isTapped ? 'transition-none' : 'hover:scale-102 transition-transform duration-300',
					'will-change-transform',
					"backdrop-blur-xl rounded-2xl overflow-hidden",
					'rounded-2xl',
					'ring-2 ring-blue-500/50', // Ring color and base width
					'ring-offset-transparent', // Base offset color
					'w-full h-full'
				)}


				// Apply blur and clipping here
				onTapStart={handleTapStart}
				onTap={handleTapEnd}
				onTapCancel={handleTapCancel}
				// Apply initial scale if needed, though controls handle it
				initial={{ scale: 1 }}
				// Use the same controls for scale animation for synchronization
				animate={controls}
				transition={{ type: 'spring', stiffness: 600, damping: 30 }} // Spring for scale
			>
				{children}
			</motion.div>
		</div>

	);
};