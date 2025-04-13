'use client';

import React from 'react';
import cn from 'classnames';
import { useAccount } from 'wagmi';
import { formatUnits, Address } from 'viem';
import { formatDistanceToNowStrict } from 'date-fns';
import { PieChartIcon } from 'lucide-react';

import { useAccountStakeInfo } from '@/hooks/useAccountStakeInfo';
import { usePanel } from '@/hooks/usePanel';
import { PANEL, STYLE } from '@/enums';
import { TapScaleWrapper } from '@/components/util/TapScaleWrapper';
import type { PublicRealmConfig } from '@lerp/contracts'; // Keep this if needed, maybe for stakeRealmId

// Define StakerDetails locally if not exported
interface StakerDetails {
	address: Address;
	totalStaked: string;
	realms: {
		[realmId: number]: {
			totalStaked: string; // Stringified bigint
			latestUnlockTime: number; // Unix timestamp (seconds)
		}
	};
}

// Assuming realmConfig provides stakeRealmId
export function RealmStakeCard({ realmConfig }: { realmConfig: PublicRealmConfig }) {
	const { address: accountAddress } = useAccount();
	const { navToPanel } = usePanel();
	const { data: stakeInfo, isLoading: isLoadingStake } = useAccountStakeInfo({ accountAddress });

	const realmStakeData = stakeInfo?.realms?.[realmConfig.stakeRealmId];

	const userStakeAmount = realmStakeData?.totalStaked
		? parseFloat(formatUnits(BigInt(realmStakeData.totalStaked), 18)).toFixed(3) // Format from wei, 3 decimals
		: "0.000";

	const unlockTimestamp = realmStakeData?.latestUnlockTime; // Seconds
	const unlockDate = unlockTimestamp ? new Date(unlockTimestamp * 1000) : null;
	const timeUntilUnlock = unlockDate && unlockDate > new Date()
		? formatDistanceToNowStrict(unlockDate, { addSuffix: true })
		: null; // Or "Unlocked" / "N/A"

	// TODO: Fetch or calculate stake percentage
	const userStakePercentage = "??"; // Placeholder

	const handleStakeClick = () => {
		navToPanel(PANEL.STAKE, { realmId: realmConfig.stakeRealmId.toString() });
	};

	return (
		<div className="bg-yellow-400 text-black rounded-xl p-8 w-full flex flex-col gap-4 h-[15em]">
			<div className="flex justify-between items-start">
				<PieChartIcon className="w-6 h-6 opacity-80" />
				<div className="text-right">
					<div className="text-xl font-bold">{userStakeAmount} $LFT</div>
					<div className="text-lg font-medium opacity-80">{userStakePercentage}%</div>
				</div>
			</div>
			<div className="flex flex-col items-center gap-3 mt-2">
				{timeUntilUnlock ? (
					<span className="text-xs opacity-70">unlocks {timeUntilUnlock}</span>
				) : realmStakeData ? ( // Check realmStakeData first
					<span className="text-xs opacity-70">Unlocked</span> // Show unlocked if stake exists
				) : null /* Or show nothing/default if no stake */}
				<TapScaleWrapper onTap={handleStakeClick} className="mt-2">
					<button className={cn(STYLE.BLACK_BUTTON, 'px-6 py-2 text-sm')}>
						Stake
					</button>
				</TapScaleWrapper>
			</div>
		</div>

	);
}