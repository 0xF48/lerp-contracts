'use client';

import React, { useState, useMemo, useEffect } from 'react';
import cn from "classnames";
import { usePanel } from "@/hooks/usePanel";
import { PANEL, STYLE } from "@/enums";
import { TapScaleWrapper } from "../util/TapScaleWrapper";
import { useLerpToken } from '@/hooks/useLerpToken';
import { formatUnits, parseUnits, isAddress } from 'viem';
import { MinusIcon, PlusIcon } from 'lucide-react'; // Import icons

const showButtonPosition = `
	sticky z-20 left-0 bottom-10
	max-w-[30em] w-[90%] mt-10
`

const showButtonStyle = `
	bg-blue-500 text-white p-6 rounded-2xl /* Removed opacity */
	justify-between
	flex flex-row items-center
	items-center
	justify-between
	px-10
	cursor-pointer
`


export function BuyPanelContent() {
	const [buyAmountLft, setBuyAmountLft] = useState('1'); // Default to 1 (integer)
	const {
		userLftBalance,
		salePricePerLft,
		availableTokensForSale,
		isConnected,
		accountAddress,
		buyTokens,
		buyIsLoading,
		buyIsSuccess,
		buyTransactionHash,
		refetchAll,
	} = useLerpToken();

	// Refetch data when the panel becomes visible or transaction completes
	useEffect(() => {
		if (buyIsSuccess) {
			refetchAll();
		}
	}, [buyIsSuccess, refetchAll]);

	// Handler for +/- buttons
	const handleAmountChange = (increment: number) => {
		setBuyAmountLft(prev => {
			const current = parseInt(prev, 10) || 0;
			const next = Math.max(1, current + increment);
			return next.toString();
		});
	};

	// Handler for direct input change
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (value === '' || /^\d+$/.test(value)) {
			if (value === '0') {
				setBuyAmountLft(value);
			} else {
				setBuyAmountLft(value.replace(/^0+(?!$)/, ''));
			}
		}
	};

	// Ensure input value is at least 1 integer when focus is lost
	const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		const value = parseInt(e.target.value, 10);
		if (isNaN(value) || value <= 0) {
			setBuyAmountLft('1');
		} else {
			setBuyAmountLft(value.toString());
		}
	};


	const calculatedCostEth = useMemo(() => {
		const amountNum = parseInt(buyAmountLft, 10);
		if (isNaN(amountNum) || amountNum <= 0 || !salePricePerLft || salePricePerLft === 'N/A') {
			return '0.00';
		}
		try {
			const amount = parseUnits(buyAmountLft, 18);
			const price = parseUnits(salePricePerLft, 18);
			const cost = (amount * price) / parseUnits('1', 18);
			return parseFloat(formatUnits(cost, 18)).toFixed(4);
		} catch (e) {
			console.error("Error calculating cost:", e);
			return 'Error';
		}
	}, [buyAmountLft, salePricePerLft]);

	// Placeholder for discount
	const discountPercentage = useMemo(() => {
		const amount = parseInt(buyAmountLft, 10) || 0;
		const totalAvailable = parseFloat(availableTokensForSale) || Infinity;
		if (totalAvailable === 0 || totalAvailable === Infinity || amount <= 0) return '0';
		const maxDiscount = 0.5;
		const discount = Math.min(maxDiscount, (amount / totalAvailable) * maxDiscount) * 100;
		return discount.toFixed(0);
	}, [buyAmountLft, availableTokensForSale]);


	const handleBuyClick = () => {
		const amountNum = parseInt(buyAmountLft, 10);
		if (isNaN(amountNum) || amountNum <= 0) {
			alert("Please enter a valid whole number amount (at least 1).");
			setBuyAmountLft('1');
			return;
		}
		buyTokens(amountNum.toString());
	};

	// Calculate padding bottom needed for the fixed section
	// Button height (h-12 = 3rem) + gap (gap-3 = 0.75rem) + bottom padding (p-6 = 1.5rem) + status text height (h-4 = 1rem) + status text margin (mt-2 = 0.5rem)
	// Total approx = 3 + 0.75 + 1.5 + 1 + 0.5 = 6.75rem. Let's use pb-28 (7rem) for safety.
	return (
		<>
			<div className={'w-full h-fit text-white p-6 flex flex-col gap-6 font-mono relative pb-28'}> {/* Added relative and padding-bottom */}
				{/* Top Section: Amount Input */}
				<div className="flex flex-col gap-3">
					<div className="flex items-end justify-between bg-blue-600 p-4 rounded-lg">
						<input
							type="text"
							inputMode="numeric"
							pattern="\d*"
							value={buyAmountLft}
							onChange={handleInputChange}
							onBlur={handleInputBlur}
							placeholder="1"
							className="bg-transparent text-4xl font-bold outline-none w-full text-white placeholder-blue-300" // Removed opacity
						/>
						{/* Changed subtext color and size */}
						<span className="text-black text-sm ml-2 whitespace-nowrap">/ {availableTokensForSale !== 'N/A' ? parseFloat(availableTokensForSale).toFixed(0) : '...'}</span>
					</div>
					<div className="flex justify-end gap-3">
						{/* Removed opacity from buttons */}
						<button onClick={() => handleAmountChange(-1)} className="bg-blue-600 p-2 rounded-md hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50" disabled={parseInt(buyAmountLft, 10) <= 1}>
							<MinusIcon size={20} />
						</button>
						<button onClick={() => handleAmountChange(1)} className="bg-blue-600 p-2 rounded-md hover:bg-blue-700 active:bg-blue-800 transition-colors">
							<PlusIcon size={20} />
						</button>
					</div>
				</div>

				{/* Mid Section: Info */}
				<div className="flex flex-col gap-3 text-lg">
					<div>
						{/* Changed subtext color and size */}
						<div className="text-black text-sm uppercase tracking-wider">Discount</div>
						<div className="font-bold">{discountPercentage}%</div>
					</div>
					<div>
						{/* Changed subtext color and size */}
						<div className="text-black text-sm uppercase tracking-wider">Price per token</div>
						<div className="font-bold">{salePricePerLft} ETH</div>
					</div>
				</div>

				{/* Spacer div to push content above fixed bottom section */}
				<div className="flex-grow"></div>

				{/* Bottom Section: Total Cost & Buy Button - Fixed */}
				{/* Added absolute positioning, background matching panel, padding */}


				{/* Status messages container */}
				<div className="h-4 mt-1 text-center"> {/* Adjusted margin */}
					{buyIsSuccess && (
						<div className="text-green-300 text-xs break-all">
							Success! Tx: {buyTransactionHash}
						</div>
					)}
					{!isConnected && (
						<div className="text-yellow-300 text-xs">Please connect wallet</div>
					)}
					{/* Error display is handled by global overlay */}
				</div>
			</div>

			<div className="absolute bottom-0 left-0 right-0 p-6 bg-blue-500 flex flex-col gap-3 border-t border-blue-600">
				<div className="flex justify-between items-baseline px-4">
					<span className="text-2xl font-bold text-white">{calculatedCostEth}</span>
					{/* Changed subtext color and size */}
					<span className="text-black text-2xl">ETH</span>
				</div>

				<button
					onClick={handleBuyClick}
					disabled={buyIsLoading || !isConnected || !buyAmountLft || parseInt(buyAmountLft, 10) <= 0}
					className={cn(
						STYLE.BLACK_BUTTON,
						'w-full justify-center text-lg py-3',
						{ 'opacity-50 cursor-not-allowed': buyIsLoading || !isConnected || !buyAmountLft || parseInt(buyAmountLft, 10) <= 0 }
					)}
				>
					{buyIsLoading ? 'Purchasing...' : 'Buy'}
				</button>
			</div>
		</>
	);
}

// Keep BuyPanelButton as is
export function BuyPanelButton() {
	const { navToPanel } = usePanel();
	const saleEndTimePlaceholder = "10 days";

	return <TapScaleWrapper className={cn(showButtonPosition)} onTap={() => navToPanel(PANEL.BUY)}>
		<div className={cn(showButtonStyle)}>
			<span className="text-blue-950">sale ends in <strong className="text-blue-950 font-bold text-lg">{saleEndTimePlaceholder}</strong></span>
			<span className="font-bold text-lg">Buy Now</span>
		</div>
	</TapScaleWrapper>


}