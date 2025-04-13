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
export function RealmClaimCard({ realmConfig }: { realmConfig: PublicRealmConfig }) {
	const { address: accountAddress } = useAccount();


	return (
		<div className="bg-green-400 text-black rounded-xl p-8 w-full flex flex-col gap-4 h-[15em]">
			todo
		</div>

	);
}