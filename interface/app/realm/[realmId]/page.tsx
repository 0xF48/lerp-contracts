import React, { Suspense } from 'react'; // Import React and Suspense
import { ChevronLeftIcon } from "lucide-react"; // Added TestTubeIcon, ServerIcon
import { NAV, PANEL, STYLE } from "@/enums";
import AccountBalanceButton from "@/components/util/AccountBalanceButton"; // Keep for top right
import cn from "classnames";
import Link from "next/link";
import { usePanel } from "@/hooks/usePanel";
import { useAccount } from 'wagmi'; // Import useAccount
import { getAPIAssetPath } from '@/hooks/getAPIAssetPath'; // Import asset path helper
import { AnimatedLerpLogo } from '@/components/util/AnimatedLerpLogo';
import { getPublicRealmData } from '@/hooks/getPublicRealmData';
import { RealmActions } from './RealmActions';
import { RealmBanner } from '@/components/util/RealmBanner';



function RealmStatEntry({ label, children }: { label: string, children: any }) {
	return (
		<div className={cn("flex justify-between items-center py-2", STYLE.BORDER_DASHED_BOT, STYLE.BORDER_DASHED_BOT_STONE)}>
			<span className="text-stone-500 text-sm">{label}:</span>
			<span className="text-white font-bold text-sm">{children}</span>
		</div>
	);

}



export default async function RealmIdPage({ params }: { params: { realmId: string } }) {
	const { realmId } = await params;
	const { realmConfig, realmStatus, error } = await getPublicRealmData(realmId); // Use mock data hook


	if (!realmConfig) {
		return <div className="bg-red-500 text-white rounded-xl p-4">Realm config not found</div>
	}

	const realmBannerPreview = getAPIAssetPath(realmConfig.bannerUrl)




	return (
		<div className={cn("relative min-h-screen bg-stone-800 text-white")}> {/* Ensure background and min height */}

			<div className={cn(STYLE.PAGE_NAV, "absolute top-0 left-0 right-0 z-10")}> {/* Make nav absolute */}
				<Link href={NAV.DASH} className={cn(STYLE.WHITE_BUTTON, 'w-fit h-10 px-3')}> {/* Use WHITE_BUTTON */}
					<ChevronLeftIcon className={cn(STYLE.BUTTON_ICON, 'h-4 w-4')} />
					Dash
				</Link>
				{/* Use Suspense for client-side components */}
				<Suspense fallback={<div className="h-10 w-32 bg-stone-700 rounded-xl animate-pulse"></div>}>
					<AccountBalanceButton />
				</Suspense>
			</div>

			{/* Main Content Area */}
			<div className={cn(STYLE.PAGE_CONTENT, 'gap-12 font-mono pt-8 max-w-lg items-center')}> {/* Add top padding */}
				<AnimatedLerpLogo className='invert' />
				<h1 className="text-lg text-gray-400">Realm / <span className="font-bold text-white">{realmConfig.name}</span></h1>

				{error && <div className="bg-red-500 text-white rounded-xl p-4">{error.message}</div>}

				<RealmBanner config={realmConfig} />

				<RealmActions realmId={realmId} />

				{/* Stats Section */}
				<div className="flex flex-col gap-3">
					{/* Network Row (Different style) */}
					{/* <RealmStatEntry label="Network">
						{chainInfoMap[realmInfo.contract.chain]?.name || `Chain ${realmInfo.contract.chain}`} / {realmInfo.networkSymbol}
					</RealmStatEntry> */}

					{/* <RealmStatEntry label="Total Staked">
						{realmInfo.totalStaked} $LFT
					</RealmStatEntry>

					<RealmStatEntry label="Game Status">
						{realmInfo.gameStatus}
					</RealmStatEntry>

					<RealmStatEntry label="Max Public Share">
						{realmInfo.maxShare}
					</RealmStatEntry>

					<RealmStatEntry label="Max Public Share">
						{realmInfo.maxShare}
					</RealmStatEntry>

					<RealmStatEntry label="Players Online">
						{realmInfo.online}
					</RealmStatEntry>

					<RealmStatEntry label="Worlds Online">
						{realmInfo.worlds}
					</RealmStatEntry> */}
				</div>

				{/* Spacer div - content above sticky footer ends here */}
			</div>


		</div> // This closing div corresponds to the main wrapper div
	); // This closing parenthesis corresponds to the return statement
} // This closing brace corresponds to the RealmIdPage function

// Removed chainInfoMap from here as it's moved to the top
