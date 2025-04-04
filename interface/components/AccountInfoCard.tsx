'use client';

import React from 'react';
import { useAccount } from 'wagmi';
import { useLerpToken } from '@/hooks/useLerpToken';
import cn from 'classnames';

// Helper function to truncate address
const truncateAddress = (address: string | undefined) => {
	if (!address) return 'Not Connected';
	return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export const AccountInfoCard: React.FC = () => {
	const { address: accountAddress, isConnected } = useAccount();
	const { userLftBalance } = useLerpToken();

	// Placeholder for staked amount
	const stakedAmount = "0.00";

	return (
		<div className="w-full flex flex-col items-start gap-2 font-mono mb-6">
			{/* Connected Account Label */}
			<div className="text-sm text-gray-600 px-1">
				Connected Account: {truncateAddress(accountAddress)}
			</div>

			{/* Blue Info Card */}
			<div className="bg-blue-500 text-white rounded-xl p-6 w-full flex flex-col gap-4">
				{/* Available Balance */}
				<div className="flex justify-between items-baseline">
					<span className="text-lg">Available</span>
					<span className="text-lg font-bold">{isConnected ? userLftBalance : '0.00'} $LFT</span>
				</div>

				{/* Staked Balance */}
				<div className="flex justify-between items-baseline">
					{/* Highlight "Staked" text differently if needed, e.g., text-yellow-300 */}
					<span className="text-lg text-yellow-300">Staked</span>
					<span className="text-lg font-bold">{isConnected ? stakedAmount : '0.00'} $LFT</span>
				</div>

				{/* Realm Selection Text */}
				<div className="mt-2 text-sm text-blue-200">
					select a realm from below to view details and stake
				</div>
			</div>
		</div>
	);
};