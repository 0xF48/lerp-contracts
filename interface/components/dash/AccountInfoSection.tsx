'use client';

import React from 'react';
import { useAccount } from 'wagmi';
import { useLerpToken } from '@/hooks/useLerpToken';
import cn from 'classnames';
import { STYLE } from '@/enums';
import { useAccountStakeInfo } from '@/hooks/useAccountStakeInfo';
import { LoaderIcon } from 'lucide-react';
import { formatEther } from 'viem';

// Helper function to truncate address
const truncateAddress = (address: string | undefined) => {
	if (!address) return 'Not Connected';
	return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export const AccountInfoSection: React.FC = () => {
	const { address: accountAddress, isConnected } = useAccount();
	const { userLftBalance } = useLerpToken();
	const { isLoading, data } = useAccountStakeInfo<any>({ accountAddress });


	if (!isConnected) {
		return null; // Don't render if not connected
	}

	// Placeholder for staked amount
	let stakedAmount = null

	if (data && data.totalStaked) {
		stakedAmount = formatEther(data.totalStaked)
	} else {
		stakedAmount = '-'
	}

	return (
		<div className={cn("w-full flex flex-col gap-8 p-8", STYLE.BORDER_DASHED_BOT)}>
			{/* Connected Account Label */}
			<div className="text-gray-400 w-full justify-between flex flex-row">
				Account:
				<span className='font-bold text-black'>{truncateAddress(accountAddress)}</span>
			</div>

			{/* Blue Info Card */}
			<div className="bg-blue-500 text-white rounded-xl p-8 w-full flex flex-col gap-4 h-[20em]">
				{isLoading == true ? <div className='w-full h-full flex items-center justify-center'>
					<LoaderIcon size={16} className="animate-spin" />
				</div> : <>
					{/* Available Balance */}
					<div className={cn("flex justify-between items-baseline pb-4", STYLE.BORDER_DASHED_BOT_BLUE)}> {/* Added padding-bottom and border */}
						<span className="text-lg">Available</span>
						<div className="text-lg font-bold">{userLftBalance} <span className='text-blue-700'>$LFT</span></div>
					</div>

					{/* Staked Balance */}
					{/* Added padding-top/bottom and border */}
					<div className={cn("flex justify-between items-baseline py-4", STYLE.BORDER_DASHED_BOT_BLUE)}>
						<span className="text-lg text-yellow-300">Staked</span>
						<div className="text-lg font-bold">{stakedAmount} <span className='text-blue-700'>$LFT</span></div>
					</div>

					{/* Realm Selection Text */}
					<div className="pt-4 text-sm text-blue-200"> {/* Added padding-top */}
						select a realm from below to view details and stake
					</div>
				</>}

			</div>
		</div>
	);
};