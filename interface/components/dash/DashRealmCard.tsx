import React from 'react';
import cn from 'classnames';
import { PANEL, STYLE } from '../../enums'; // Relative path
import { usePanel } from '../../hooks/usePanel'; // Relative path
import { NetworkChip } from '../util/NetworkChip'; // Relative path
import Link from 'next/link';
import { RealmBanner } from '../util/RealmBanner';
import type { PublicRealmConfig } from '@lerp/contracts'; // Removed StakerDetails import
import { useAccountStakeInfo } from '@/hooks/useAccountStakeInfo';
import { useAccount } from 'wagmi';
import { formatUnits, Address } from 'viem'; // Added Address type
import { TapScaleWrapper } from '../util/TapScaleWrapper';
import { RealmCardAccountInfoStats } from './realm/RealmCardAccountInfoStats';



export function DashRealmCard({ config }: { config: PublicRealmConfig }) {

	// Determine currency symbol based on chain ID (simple example)
	// TODO: Replace with a more robust method, potentially from config or a utility function
	const getCurrencySymbol = (chainId: number) => {
		switch (chainId) {
			case 1: return "$ETH"; // Ethereum Mainnet
			case 137: return "$MATIC"; // Polygon Mainnet
			case 80001: return "$MATIC"; // Polygon Mumbai Testnet
			// Add other chains as needed
			default: return "$???";
		}
	};
	const claimCurrencySymbol = getCurrencySymbol(config.contract.chain);

	return (
		<Link href={`/realm/${config.id}`} className="block w-full rounded-2xl overflow-hidden p-2"> {/* Link wrapper */}
			<TapScaleWrapper className="block"> {/* TapScaleWrapper for hover effect */}
				<div className="w-full bg-stone-800 flex flex-col gap-4 p-5 text-white font-mono"> {/* Original content div */}
					{/* Top Section */}
					<div className="flex flex-row justify-between items-center w-full">
						{/* Adjusted styling */}
						<div className="uppercase text-stone-100 font-medium text-lg tracking-wider">
							{config.name}
						</div>
						{config.currentVersion && (
							<div className="text-sm text-stone-400">
								v{config.currentVersion}
							</div>
						)}
					</div>

					{/* Banner */}
					<RealmBanner realmId={config.id} />

					{/* Info Section - Adjusted structure and styling */}
					<div className="flex flex-col gap-2 mt-2"> {/* Reduced gap */}
						{/* Network Row */}
						<div className="flex justify-between items-center">
							<span className="text-stone-400 text-sm">network:</span>
							<NetworkChip chainId={config.contract.chain} />
						</div>
						{/* <RealmCardAccountInfoStats config={config} /> */}

					</div>

					{/* Details Button Section - Changed Link to div, added TapScaleWrapper */}
					<div className="flex justify-center mt-6"> {/* Increased margin-top */}
						<TapScaleWrapper className="block">
							<div // Changed from Link to div
								className={cn(
									// STYLE.STONE_BUTTON, // Base styles if needed, but overriding bg
									'bg-stone-600 hover:bg-stone-500 active:bg-stone-700', // Lighter button style
									'px-10 py-2 rounded-lg text-sm text-white font-mono transition-colors duration-150' // Padding, text size, ensure text color
								)}
							>
								Details
							</div>
						</TapScaleWrapper>
					</div>
				</div>
			</TapScaleWrapper>
		</Link>
	); // End return
}