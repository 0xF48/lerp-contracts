'use client'

import { useAccountStakeInfo } from "@/hooks/useAccountStakeInfo";
import { usePanel } from "@/hooks/usePanel";
import { PublicRealmConfig } from "@lerp/contracts";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";

export function RealmCardAccountInfoStats({ config }: { config: PublicRealmConfig }) {

	const { navToPanel } = usePanel(); // Keep navToPanel if needed elsewhere, otherwise remove
	const { address: accountAddress } = useAccount();



	// Fetch stake info for the connected account
	const { data: stakeInfo, isLoading: isLoadingStake } = useAccountStakeInfo({ accountAddress });

	// Extract stake amount for this specific realm
	const realmStakeData = stakeInfo?.realms?.[config.stakeRealmId];


	const userStakeAmount = realmStakeData?.totalStaked
		? parseFloat(formatUnits(BigInt(realmStakeData.totalStaked), 18)).toFixed(1) // Format from wei
		: "0.0";

	// TODO: Fetch or calculate stake percentage
	const userStakePercentage = "??"; // Placeholder - requires total staked in realm

	const realmCurrencySymbol = "??" // chain id should be in PublicRealmConfig

	// TODO: Fetch claimable amount
	const userClaimableAmount = "0.0"; // Placeholder

	return <>
		<div className="flex justify-between items-center">
			<span className="text-stone-400 text-sm">stake:</span>
			{/* Use placeholders */}
			<span className="text-white font-medium">{userStakeAmount}$LFT <span className="text-stone-500">/ {userStakePercentage}%</span></span>
		</div>
		{/* Claim Row */}
		<div className="flex justify-between items-center">
			{/* Added underline to label */}
			{/* Claim label - now just text */}
			<span className="text-stone-400 text-sm">claim:</span>
			{/* Use placeholders */}
			<span className="text-white font-medium">{userClaimableAmount} {realmCurrencySymbol}</span>
		</div>
	</>
}