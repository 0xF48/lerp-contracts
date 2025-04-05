'use client'; // Add use client directive as it will likely use hooks later

import React from 'react'; // Import React
import { getAPIAssetPath } from "@/hooks/getAPIAssetPath"; // Assuming this hook exists and works
import cn from 'classnames';
import { PANEL, STYLE } from '@/enums'; // Import PANEL
// Removed unused chain imports: import { hardhat, polygon, sepolia } from 'wagmi/chains';
// Removed unused icon import: import { LinkIcon } from 'lucide-react';
import { usePanel } from '@/hooks/usePanel'; // Import usePanel hook
import { NetworkChip } from '../util/NetworkChip'; // Import the new component
import Link from 'next/link';
import { ArrowUpDownIcon, HandCoinsIcon } from 'lucide-react';
import { RealmBanner } from '../util/RealmBanner';
import { PublicRealmConfig } from '@/enums';



// Removed chainInfoMap as logic is now in NetworkChip

export function DashRealmCard({ config }: { config: PublicRealmConfig }) {
	const { navToPanel } = usePanel(); // Get panel navigation function

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
		<div className="w-full bg-stone-900 rounded-2xl flex flex-col gap-4 p-6 text-white font-mono"> {/* Adjusted padding and gap */}
			{/* Top Section: Name and Version */}
			<div className="flex flex-row justify-between items-center w-full">
				<div className="uppercase text-yellow-400 font-bold text-lg">
					{config.name}
				</div>
				{config.currentVersion && (
					<div className="text-sm text-stone-400">
						v{config.currentVersion}
					</div>
				)}
			</div>

			{/* Banner Image */}
			<RealmBanner config={config} /> {/* Use the new RealmBanner component */}

			{/* Info Section */}
			<div className="flex flex-col gap-3 mt-2"> {/* Added margin-top */}
				{/* Network */}
				<div className={cn("flex justify-between items-center py-3", STYLE.BORDER_DASHED_BOT_STONE)}>
					<span className="text-stone-400 text-sm">network:</span>
					{/* Use NetworkChip component */}
					<NetworkChip chainId={config.contract.chain} />
				</div>
				{/* Released */}
				<div className={cn("flex justify-between items-center py-3", STYLE.BORDER_DASHED_BOT_STONE)}>
					<span className="text-stone-400 text-sm">released:</span>
					<span className="text-white font-bold">{releaseStatus}</span>
				</div>
				{/* Your Stake */}
				<div className={cn("flex justify-between items-center py-3", STYLE.BORDER_DASHED_BOT_STONE)}>
					<span className="text-stone-400 text-sm">your stake:</span>
					<span className="text-white font-bold">{userStakePercentage} <span className="text-stone-500 text-xs">/ {profitCap}</span></span>
				</div>
			</div>

			{/* Buttons Section */}
			<div className="flex gap-4 mt-4"> {/* Added margin-top */}
				<Link href={`/realm/${config.id}`} className={cn(STYLE.STONE_BUTTON, 'flex-1 justify-center px-4')}>Details</Link>
				{/* Added onClick handler */}
				<button
					onClick={() => navToPanel(PANEL.STAKE)}
					className={cn(STYLE.YELLOW_BUTTON, 'flex justify-center items-center')}>
					<ArrowUpDownIcon className={STYLE.BUTTON_ICON} />
				</button>
				<button
					onClick={() => navToPanel(PANEL.CLAIM)}
					className={cn(STYLE.GREEN_BUTTON, 'flex justify-center items-center')}>
					<HandCoinsIcon className={STYLE.BUTTON_ICON + ' text-black'} />
				</button>
			</div>
		</div>
	);
}