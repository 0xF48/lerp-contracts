'use client';

import React from 'react';
import cn from 'classnames';
import { hardhat, polygon, sepolia } from 'wagmi/chains';
import { LinkIcon, ServerIcon, TestTubeIcon } from 'lucide-react'; // Using generic icons for now
import { STYLE } from '@/enums'; // Assuming STYLE enum has BLACK_BUTTON_CHIP

interface NetworkChipProps {
	chainId: number;
	className?: string;
}

// Map chain IDs to names and icons (extend as needed)
// Using more distinct icons
const chainInfoMap: { [chainId: number]: { name: string, Icon: React.FC<any> } } = {
	[hardhat.id]: { name: 'Hardhat', Icon: TestTubeIcon }, // Test tube for local dev
	[polygon.id]: { name: 'Polygon', Icon: LinkIcon }, // Polygon icon if available, else Link
	[sepolia.id]: { name: 'Sepolia', Icon: ServerIcon }, // Server icon for testnet
	// Add other chains used by realms
};

export const NetworkChip: React.FC<NetworkChipProps> = ({ chainId, className }) => {
	const network = chainInfoMap[chainId] || { name: `Chain ${chainId}`, Icon: LinkIcon }; // Default icon

	return (
		<span className={cn(
			STYLE.BLACK_BUTTON_CHIP, // Use existing style
			"px-3 py-1 text-xs flex items-center gap-1 w-fit", // Ensure it fits content
			className // Allow overriding styles
		)}
		>
			<network.Icon size={12} />
			{network.name}
		</span>
	);
};