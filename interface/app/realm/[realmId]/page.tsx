'use client'; // Needs to be client component to use hooks

import React, { Suspense } from 'react'; // Import React and Suspense
import { ChevronLeftIcon, PlayIcon, Link as LinkIconLucide, CircleHelpIcon, TestTubeIcon, ServerIcon } from "lucide-react"; // Added TestTubeIcon, ServerIcon
import { NAV, PANEL, STYLE } from "@/enums";
import AccountBalanceButton from "@/components/AccountBalanceButton"; // Keep for top right
import cn from "classnames";
import Link from "next/link";
import { usePanel } from "@/hooks/usePanel";
import { NetworkChip } from '@/components/NetworkChip'; // Import NetworkChip
import { useAccount } from 'wagmi'; // Import useAccount
import { getAPIAssetPath } from '@/hooks/getAPIAssetPath'; // Import asset path helper
import { hardhat, polygon, sepolia } from 'wagmi/chains'; // Added chain imports

// Define chainInfoMap here, before components that use it
const chainInfoMap: { [chainId: number]: { name: string, Icon: React.FC<any> } } = {
	[hardhat.id]: { name: 'Hardhat', Icon: TestTubeIcon },
	[polygon.id]: { name: 'Polygon', Icon: LinkIconLucide },
	[sepolia.id]: { name: 'Sepolia', Icon: ServerIcon },
};

// Mock data structure based on feedback - replace with actual data fetching
const useMockRealmData = (realmId: string) => {
	const mockData = {
		id: realmId,
		name: realmId.toUpperCase(), // Example: PODRUN
		bannerUrl: `/assets/realms/${realmId}/${realmId}.png`, // Example path
		contract: {
			chain: 31337, // Example: Hardhat
			address: "0x...", // Placeholder address
		},
		currentVersion: "0.44", // Example version
		// Add placeholders based on new design
		networkSymbol: "$POL", // Example
		totalStaked: "12.41",
		gameStatus: "UNRELEASED",
		maxShare: "40%",
		online: "1",
		worlds: "4",
	};
	return { realmInfo: mockData, isLoading: false, error: null }; // Simulate hook return
}

export default function RealmIdPage({ params }: { params: { realmId: string } }) {
	const { realmId } = params;
	const { realmInfo, isLoading, error } = useMockRealmData(realmId); // Use mock data hook
	const { navToPanel } = usePanel();
	const { isConnected } = useAccount();

	const realmBannerPreview = realmInfo?.bannerUrl ? getAPIAssetPath(realmInfo.bannerUrl) : undefined;

	const handleStakeClick = () => navToPanel(PANEL.STAKE);
	const handleClaimClick = () => navToPanel(PANEL.CLAIM);

	if (isLoading) return <div className="text-center p-10">Loading realm info...</div>; // Add loading state
	if (error || !realmInfo) return <div className="text-center p-10 text-red-500">Error loading realm info.</div>; // Add error state

	// Calculate padding needed for sticky footer (approx button height + padding)
	const footerPadding = 'pb-24'; // Adjust as needed

	return (
		<div className={cn("relative min-h-screen bg-gray-800 text-white", footerPadding)}> {/* Ensure background and min height */}
			{/* Navigation */}
			<div className={cn(STYLE.PAGE_NAV, "absolute top-0 left-0 right-0 z-10")}> {/* Make nav absolute */}
				<Link href={NAV.DASH} className={cn(STYLE.WHITE_BUTTON, 'w-fit h-10 px-3')}> {/* Use WHITE_BUTTON */}
					<ChevronLeftIcon className={cn(STYLE.BUTTON_ICON, 'h-4 w-4')} />
					Dash
				</Link>
				{/* Use Suspense for client-side components */}
				<Suspense fallback={<div className="h-10 w-32 bg-gray-700 rounded-xl animate-pulse"></div>}>
					<AccountBalanceButton />
				</Suspense>
			</div>

			{/* Main Content Area */}
			<div className={cn(STYLE.PAGE_CONTENT, 'gap-6 font-mono pt-24 max-w-lg')}> {/* Add top padding */}

				{/* Top Section: Icon, Title, Network */}
				<div className="flex flex-col items-center gap-4 text-center">
					<div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
						{/* Placeholder Icon */}
						<CircleHelpIcon size={32} className="text-gray-500" />
					</div>
					<h1 className="text-lg text-gray-400">Realm / <span className="font-bold text-white">{realmInfo.name}</span></h1>
					<NetworkChip chainId={realmInfo.contract.chain} />
				</div>


				{/* Banner Image */}
				<div className="relative w-full h-40 rounded-xl object-cover bg-gradient-to-br from-indigo-800 to-blue-800 justify-center items-center content-center flex overflow-hidden shadow-lg">
					{realmBannerPreview && (
						<div className="z-10 relative flex items-center justify-center p-4 h-full">
							<img src={realmBannerPreview} alt={`${realmInfo.name} Banner`} className="max-h-full object-contain" />
						</div>
					)}
					<div className="absolute inset-0 bg-black/30 z-0"></div>
				</div>

				{/* Action Buttons (Trailer, Play) */}
				<div className="flex gap-4 w-full">
					<a href="https://lerp.io" target="_blank" rel="noopener noreferrer" className={cn(STYLE.BLACK_BUTTON, 'flex-1 justify-center text-sm h-10')}> {/* Use BLACK_BUTTON */}
						Trailer
					</a>
					<a href="https://lerp.io" target="_blank" rel="noopener noreferrer" className={cn(STYLE.BLACK_BUTTON, 'flex-1 justify-center text-sm h-10')}> {/* Use BLACK_BUTTON */}
						Play
					</a>
				</div>

				{/* Stats Section */}
				<div className="flex flex-col gap-3">
					{/* Network Row (Different style) */}
					<div className={cn("flex justify-between items-center py-2", STYLE.BORDER_DASHED_BOT)}>
						<span className="text-gray-400 text-sm">network:</span>
						<span className="text-white font-bold text-sm">{chainInfoMap[realmInfo.contract.chain]?.name || `Chain ${realmInfo.contract.chain}`} / {realmInfo.networkSymbol}</span>
					</div>
					{/* Other Stats */}
					<div className={cn("flex justify-between items-center py-2", STYLE.BORDER_DASHED_BOT)}>
						<span className="text-gray-400 text-sm">total staked:</span>
						<span className="text-white font-bold text-sm">{realmInfo.totalStaked}</span>
					</div>
					<div className={cn("flex justify-between items-center py-2", STYLE.BORDER_DASHED_BOT)}>
						<span className="text-gray-400 text-sm">game status:</span>
						<span className="text-white font-bold text-sm">{realmInfo.gameStatus}</span>
					</div>
					<div className={cn("flex justify-between items-center py-2", STYLE.BORDER_DASHED_BOT)}>
						<span className="text-gray-400 text-sm">max share:</span>
						<span className="text-white font-bold text-sm">{realmInfo.maxShare}</span>
					</div>
					<div className={cn("flex justify-between items-center py-2", STYLE.BORDER_DASHED_BOT)}>
						<span className="text-gray-400 text-sm">online:</span>
						<span className="text-white font-bold text-sm">{realmInfo.online}</span>
					</div>
					<div className={cn("flex justify-between items-center pt-2")}> {/* No border on last item */}
						<span className="text-gray-400 text-sm">worlds:</span>
						<span className="text-white font-bold text-sm">{realmInfo.worlds}</span>
					</div>
				</div>

				{/* Spacer div - content above sticky footer ends here */}
			</div>

			{/* Sticky Footer Buttons */}
			<div className="sticky bottom-0 left-0 right-0 p-4 z-20 flex flex-row justify-center items-center w-full gap-10">
				<button
					onClick={handleStakeClick}
					className={cn(STYLE.YELLOW_BUTTON, 'justify-center text-sm h-14 px-10')} // Adjusted height
				>
					Stake
				</button>
				<button
					onClick={handleClaimClick}
					className={cn(STYLE.PURPLE_BUTTON, 'justify-center text-sm h-14 px-10')} // Use PURPLE_BUTTON, adjusted height
				>
					{isConnected ? "Claim" : "Connect to claim"}
				</button>
			</div>
		</div> // This closing div corresponds to the main wrapper div
	); // This closing parenthesis corresponds to the return statement
} // This closing brace corresponds to the RealmIdPage function

// Removed chainInfoMap from here as it's moved to the top
