'use client';

import React from 'react';
import cn from 'classnames';
import { PANEL, STYLE } from '../../enums'; // Relative path
import { usePanel } from '../../hooks/usePanel'; // Relative path
import { NetworkChip } from '../util/NetworkChip'; // Relative path
import Link from 'next/link';
import { ArrowUpDownIcon, ChartNoAxesColumnIncreasingIcon, HandCoinsIcon } from 'lucide-react';
import { RealmBanner } from '../util/RealmBanner'; // Relative path
import type { PublicRealmConfig } from '@lerp/config'; // Import type from correct location

export function DashRealmCard({ config }: { config: PublicRealmConfig }) {
	const { navToPanel } = usePanel();

	// Placeholders
	const releaseStatus = "DEV";
	const userStakePercentage = "0.0%";
	const profitCap = "60%";

	return (
		<div className="w-full bg-stone-900 rounded-2xl flex flex-col gap-4 p-6 text-white font-mono">
			{/* Top Section */}
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

			{/* Banner */}
			<RealmBanner config={config} />

			{/* Info Section */}
			<div className="flex flex-col gap-3 mt-2">
				<div className={cn("flex justify-between items-center py-3", STYLE.BORDER_DASHED_BOT_STONE)}>
					<span className="text-stone-400 text-sm">network:</span>
					<NetworkChip chainId={config.contract.chain} />
				</div>
				<div className={cn("flex justify-between items-center py-3", STYLE.BORDER_DASHED_BOT_STONE)}>
					<span className="text-stone-400 text-sm">released:</span>
					<span className="text-white font-bold">{releaseStatus}</span>
				</div>
				<div className={cn("flex justify-between items-center py-3", STYLE.BORDER_DASHED_BOT_STONE)}>
					<span className="text-stone-400 text-sm">your stake:</span>
					<span className="text-white font-bold">{userStakePercentage} <span className="text-stone-500 text-xs">/ {profitCap}</span></span>
				</div>
			</div>

			{/* Buttons Section */}
			<div className="flex gap-4 mt-4">
				<button
					// Pass only stakeRealmId
					onClick={() => navToPanel(PANEL.STAKE, { realmId: config.stakeRealmId.toString() })}
					className={cn(STYLE.YELLOW_BUTTON, 'flex justify-center items-center gap-2')}>

					<ArrowUpDownIcon className={STYLE.BUTTON_ICON} />
					Stake
				</button>
				<Link
					href={`/realm/${config.id}`} className={cn(STYLE.STONE_BUTTON, 'flex-1 justify-center px-4 gap-2')}>
					<ChartNoAxesColumnIncreasingIcon className={STYLE.BUTTON_ICON} />
					Stats
				</Link>
				<button
					// Pass only stakeRealmId
					onClick={() => navToPanel(PANEL.CLAIM, { realmId: config.stakeRealmId.toString() })}
					className={cn(STYLE.GREEN_BUTTON, 'flex justify-center items-center gap-2')}>

					<HandCoinsIcon className={STYLE.BUTTON_ICON + ' text-black'} />
					Claim
				</button>
			</div>
		</div>
	);
}