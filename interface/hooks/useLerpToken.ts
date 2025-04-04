'use client';

import { useState, useEffect } from 'react'; // Removed unused useMemo
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { LERP_TOKEN_CONTRACT_ADDRESS, LERP_TOKEN_ABI } from '@/constants';
import { parseUnits, formatUnits, parseEther, zeroAddress } from 'viem';
import { useErrorHandler } from '@/contexts/ErrorHandlerContext'; // Import error handler hook

export function useLerpToken() {
	const { address: accountAddress, isConnected } = useAccount();
	const { setError } = useErrorHandler(); // Get setError from context
	const { data: hash, error: writeContractError, isPending: isWritePending, writeContract } = useWriteContract({
		mutation: {
			onError: (error) => {
				console.error("WriteContract Error:", error);
				setError(error); // Report write errors to global handler
			},
		}
	});

	// --- Read Contract Data ---

	const { data: balanceData, refetch: refetchBalance, error: balanceError } = useReadContract({
		address: LERP_TOKEN_CONTRACT_ADDRESS,
		abi: LERP_TOKEN_ABI,
		functionName: 'balanceOf',
		args: [accountAddress ?? zeroAddress],
		query: {
			enabled: isConnected && !!accountAddress,
		},
	});

	const { data: salePriceData, refetch: refetchSalePrice, error: salePriceError } = useReadContract({
		address: LERP_TOKEN_CONTRACT_ADDRESS,
		abi: LERP_TOKEN_ABI,
		functionName: 'saleTokenPrice',
		query: {
			enabled: isConnected,
		},
	});

	const { data: availableTokensData, refetch: refetchAvailableTokens, error: availableTokensError } = useReadContract({
		address: LERP_TOKEN_CONTRACT_ADDRESS,
		abi: LERP_TOKEN_ABI,
		functionName: 'saleAvailableTokens',
		query: {
			enabled: isConnected,
		},
	});

	// Report read errors globally
	useEffect(() => {
		if (balanceError) setError(balanceError);
	}, [balanceError, setError]);

	useEffect(() => {
		if (salePriceError) setError(salePriceError);
	}, [salePriceError, setError]);

	useEffect(() => {
		if (availableTokensError) setError(availableTokensError);
	}, [availableTokensError, setError]);


	// --- Transaction State ---

	// We still watch for the receipt to know when the tx is confirmed (isSuccess)
	// Errors during the transaction *mining* phase might not be caught here directly,
	// but errors during *submission* are caught by useWriteContract's onError.
	// The global ErrorOverlay will display errors set by useWriteContract.
	const { isLoading: isConfirming, isSuccess: isConfirmed, error: receiptError } =
		useWaitForTransactionReceipt({
			hash,
			// Removed invalid onError from query options
		});

	// Optional: Handle potential receipt errors if needed, though less common
	useEffect(() => {
		if (receiptError) {
			console.error("Transaction Receipt Error:", receiptError);
			setError(receiptError);
		}
	}, [receiptError, setError]);


	// --- Buy Tokens Function ---

	const buyTokens = async (lftAmountString: string) => {
		// Clear previous errors before attempting a new transaction
		setError(null);

		if (!salePriceData) {
			setError(new Error("Sale price not loaded yet."));
			return;
		}
		if (!isConnected || !accountAddress) {
			setError(new Error("Wallet not connected."));
			return;
		}

		try {
			const lftAmount = parseUnits(lftAmountString, 18);
			const salePrice = BigInt(salePriceData.toString());
			const costInWei = (lftAmount * salePrice) / parseUnits("1", 18);

			console.log(`Attempting to buy ${lftAmountString} LFT for ${formatUnits(costInWei, 18)} ETH`);

			writeContract({
				address: LERP_TOKEN_CONTRACT_ADDRESS,
				abi: LERP_TOKEN_ABI,
				functionName: 'buyTokens',
				args: [lftAmount],
				value: costInWei,
			});

		} catch (e) {
			console.error("Error preparing buy transaction:", e);
			setError(e); // Report preparation errors
		}
	};

	// --- Format Data ---
	const balance = balanceData ? formatUnits(balanceData, 18) : '0';
	const salePrice = salePriceData ? formatUnits(salePriceData, 18) : 'N/A';
	const availableTokens = availableTokensData ? formatUnits(availableTokensData, 18) : 'N/A';

	// --- Refetch All ---
	const refetchAll = () => {
		refetchBalance();
		refetchSalePrice();
		refetchAvailableTokens();
	}

	return {
		// Data
		userLftBalance: balance,
		salePricePerLft: salePrice,
		availableTokensForSale: availableTokens,
		isConnected,
		accountAddress,

		// Buy Functionality
		buyTokens,
		buyIsLoading: isWritePending || isConfirming,
		buyIsSuccess: isConfirmed,
		// buyError is removed - rely on global error state via useErrorHandler
		buyTransactionHash: hash,

		// Actions
		refetchUserBalance: refetchBalance,
		refetchSalePrice: refetchSalePrice,
		refetchAvailableTokens: refetchAvailableTokens,
		refetchAll,
	};
}