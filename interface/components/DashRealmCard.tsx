'use client'; // Add use client directive as it will likely use hooks later

import React from 'react'; // Import React
import { getAPIAssetPath } from "@/hooks/getAPIAssetPath"; // Assuming this hook exists and works
import cn from 'classnames';
import { PANEL, STYLE } from '@/enums'; // Import PANEL
// Removed unused chain imports: import { hardhat, polygon, sepolia } from 'wagmi/chains';
// Removed unused icon import: import { LinkIcon } from 'lucide-react';
import { usePanel } from '@/hooks/usePanel'; // Import usePanel hook
import { NetworkChip } from './NetworkChip'; // Import the new component

// Define a type for the config prop for better type safety
interface RealmConfig {
	id: string;
	name: string;
	bannerUrl?: string;
	media?: {
		static?: {
			src: string;
		};
	};
	contract: {
		chain: number; // Chain ID
		address: string;
		blockNumber?: string;
		tokens?: any[]; // Define more specifically if needed
	};
	currentVersion?: string; // Optional version
	// Add other potential properties like releaseStatus, userStake etc. if available
}

// Removed chainInfoMap as logic is now in NetworkChip

export function DashRealmCard({ config }: { config: RealmConfig }) {
	const { navToPanel } = usePanel(); // Get panel navigation function
	// Use optional chaining for safer access
	const realmImagePreview = config.media?.static?.src ? getAPIAssetPath(config.media.static.src) : undefined;
	const realmBannerPreview = config.bannerUrl ? getAPIAssetPath(config.bannerUrl) : undefined;

	// Removed network variable definition

	// Placeholders - replace with actual data when available
	const releaseStatus = "DEV";
	const userStakePercentage = "0.0%";
	const profitCap = "60%"; // Example profit cap

	const handleStakeClick = () => {
		// TODO: Potentially pass realm ID or config to the panel
		navToPanel(PANEL.STAKE);
	};

	return (
		<div className="w-full bg-gray-900 rounded-2xl flex flex-col gap-4 p-6 text-white font-mono"> {/* Adjusted padding and gap */}
			{/* Top Section: Name and Version */}
			<div className="flex flex-row justify-between items-center w-full">
				<div className="uppercase text-yellow-400 font-bold text-lg">
					{config.name}
				</div>
				{config.currentVersion && (
					<div className="text-sm text-gray-400">
						v{config.currentVersion}
					</div>
				)}
			</div>

			{/* Banner Image */}
			<div className="relative w-full h-32 rounded-xl object-cover bg-indigo-900 justify-center items-center content-center flex overflow-hidden"> {/* Adjusted bg */}
				{realmImagePreview && <img src={realmImagePreview} alt="Realm Background" className="absolute inset-0 w-full h-full object-cover opacity-30" />} {/* Background image */}
				<div className="z-10 w-full h-full absolute left-0 top-0 bg-gradient-to-t from-black/50 to-transparent"></div> {/* Gradient overlay */}
				{realmBannerPreview && (
					<div className="z-20 relative flex items-center justify-center px-6"> {/* Adjusted padding */}
						<img src={realmBannerPreview} alt={`${config.name} Banner`} className="max-h-16 object-contain" /> {/* Constrained banner height */}
					</div>
				)}
			</div>

			{/* Info Section */}
			<div className="flex flex-col gap-3 mt-2"> {/* Added margin-top */}
				{/* Network */}
				<div className={cn("flex justify-between items-center py-3", STYLE.BORDER_DASHED_BOT)}>
					<span className="text-gray-400 text-sm">network:</span>
					{/* Use NetworkChip component */}
					<NetworkChip chainId={config.contract.chain} />
				</div>
				{/* Released */}
				<div className={cn("flex justify-between items-center py-3", STYLE.BORDER_DASHED_BOT)}>
					<span className="text-gray-400 text-sm">released:</span>
					<span className="text-white font-bold">{releaseStatus}</span>
				</div>
				{/* Your Stake */}
				<div className={cn("flex justify-between items-center py-3", STYLE.BORDER_DASHED_BOT)}>
					<span className="text-gray-400 text-sm">your stake:</span>
					<span className="text-white font-bold">{userStakePercentage} <span className="text-gray-500 text-xs">/ {profitCap}</span></span>
				</div>
			</div>

			{/* Buttons Section */}
			<div className="flex gap-4 mt-4"> {/* Added margin-top */}
				<button className={cn(STYLE.PALE_BUTTON_CHIP, 'flex-1 justify-center px-4')}>Details</button>
				{/* Added onClick handler */}
				<button onClick={handleStakeClick} className={cn(STYLE.YELLOW_BUTTON, 'flex-1 justify-center px-4')}>Stake</button>
			</div>
		</div>
	);
}