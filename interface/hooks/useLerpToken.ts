'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
// Use @root alias to import from config directory at the project root
import { LERP_TOKEN_CONTRACT_ADDRESS, LERP_TOKEN_ABI } from '../../config';
import { parseUnits, formatUnits, parseEther, zeroAddress, Address, maxUint256 } from 'viem';
import { useErrorHandler } from '../contexts/ErrorHandlerContext'; // Relative path ok here

// Define types for staking state
type StakingStatus = 'idle' | 'checking_allowance' | 'needs_approval' | 'approving' | 'ready_to_stake' | 'staking' | 'success' | 'error';

export function useLerpToken() {
	const { address: accountAddress, isConnected } = useAccount();
	const { setError, clearError } = useErrorHandler();

	// --- Generic Write/Receipt Hooks ---
	const { data: approveHash, error: approveError, isPending: isApproving, writeContract: writeApprove } = useWriteContract({ mutation: { onError: setError } });
	const { data: stakeHash, error: stakeError, isPending: isStaking, writeContract: writeStake } = useWriteContract({ mutation: { onError: setError } });
	const { data: buyHash, error: buyError, isPending: isBuying, writeContract: writeBuy } = useWriteContract({ mutation: { onError: setError } });

	const { isLoading: isConfirmingApproval, isSuccess: isApproved } = useWaitForTransactionReceipt({ hash: approveHash });
	const { isLoading: isConfirmingStake, isSuccess: isStakeSuccess } = useWaitForTransactionReceipt({ hash: stakeHash });
	const { isLoading: isConfirmingBuy, isSuccess: isBuySuccess } = useWaitForTransactionReceipt({ hash: buyHash });

	// --- Staking Specific State ---
	const [stakingStatus, setStakingStatus] = useState<StakingStatus>('idle');
	const [stakeAmount, setStakeAmount] = useState<bigint>(BigInt(0));
	const [stakeRealmId, setStakeRealmId] = useState<number | null>(null);

	// --- Read Contract Data ---
	const { data: balanceData, refetch: refetchBalance, error: balanceError } = useReadContract({
		address: LERP_TOKEN_CONTRACT_ADDRESS,
		abi: LERP_TOKEN_ABI,
		functionName: 'balanceOf',
		args: [accountAddress ?? zeroAddress],
		query: { enabled: isConnected && !!accountAddress },
	});
	const { data: allowanceData, refetch: refetchAllowance, error: allowanceError } = useReadContract({
		address: LERP_TOKEN_CONTRACT_ADDRESS,
		abi: LERP_TOKEN_ABI,
		functionName: 'allowance',
		args: [accountAddress ?? zeroAddress, LERP_TOKEN_CONTRACT_ADDRESS],
		query: { enabled: isConnected && !!accountAddress },
	});
	const { data: salePriceData, refetch: refetchSalePrice, error: salePriceError } = useReadContract({
		address: LERP_TOKEN_CONTRACT_ADDRESS,
		abi: LERP_TOKEN_ABI,
		functionName: 'saleTokenPrice',
		query: { enabled: isConnected },
	});
	const { data: availableTokensData, refetch: refetchAvailableTokens, error: availableTokensError } = useReadContract({
		address: LERP_TOKEN_CONTRACT_ADDRESS,
		abi: LERP_TOKEN_ABI,
		functionName: 'saleAvailableTokens',
		query: { enabled: isConnected },
	});

	// --- Global Error Reporting for Reads ---
	useEffect(() => { if (balanceError) setError(balanceError); }, [balanceError, setError]);
	useEffect(() => { if (allowanceError) setError(allowanceError); }, [allowanceError, setError]);
	useEffect(() => { if (salePriceError) setError(salePriceError); }, [salePriceError, setError]);
	useEffect(() => { if (availableTokensError) setError(availableTokensError); }, [availableTokensError, setError]);

	// --- Staking Flow Logic ---
	const initiateStakingProcess = useCallback(async (realmId: number, amountLftString: string) => {
		clearError();
		setStakingStatus('idle');

		// --- Input Validation ---
		if (typeof realmId !== 'number' || isNaN(realmId) || realmId <= 0) {
			setError(new Error(`Invalid Realm ID provided: ${realmId}`));
			setStakingStatus('error');
			return;
		}
		let amountWei: bigint;
		try {
			if (!/^\d+$/.test(amountLftString)) { throw new Error("Amount must be a whole number."); }
			amountWei = parseUnits(amountLftString, 18);
			if (amountWei <= BigInt(0)) { throw new Error("Stake amount must be positive."); }
		} catch (parseError) {
			setError(new Error(`Invalid stake amount: ${parseError instanceof Error ? parseError.message : String(parseError)}`));
			setStakingStatus('error');
			return;
		}
		if (!isConnected || !accountAddress) { setError(new Error("Wallet not connected.")); setStakingStatus('error'); return; }

		// --- Proceed if valid ---
		setStakingStatus('checking_allowance');
		setStakeAmount(amountWei);
		setStakeRealmId(realmId);

		try {
			const currentAllowance = await refetchAllowance().then(res => res.data ?? BigInt(0));
			if (currentAllowance < amountWei) { setStakingStatus('needs_approval'); }
			else { setStakingStatus('ready_to_stake'); }
		} catch (allowanceCheckError) {
			console.error("Error checking allowance:", allowanceCheckError);
			setError(allowanceCheckError);
			setStakingStatus('error');
		}
	}, [isConnected, accountAddress, refetchAllowance, setError, clearError]);

	const approveStake = useCallback(() => {
		if (stakingStatus !== 'needs_approval' || stakeAmount <= BigInt(0)) return;
		clearError();
		setStakingStatus('approving');
		writeApprove({
			address: LERP_TOKEN_CONTRACT_ADDRESS,
			abi: LERP_TOKEN_ABI,
			functionName: 'approve',
			args: [LERP_TOKEN_CONTRACT_ADDRESS, maxUint256],
		});
	}, [stakingStatus, stakeAmount, writeApprove, setError, clearError]);

	useEffect(() => {
		if (isApproved && stakingStatus === 'approving') {
			setStakingStatus('ready_to_stake');
			refetchAllowance();
		}
	}, [isApproved, stakingStatus, refetchAllowance]);

	const executeStake = useCallback(() => {
		if (stakingStatus !== 'ready_to_stake' || stakeAmount <= BigInt(0) || typeof stakeRealmId !== 'number' || stakeRealmId <= 0) return;
		clearError();
		setStakingStatus('staking');
		writeStake({
			address: LERP_TOKEN_CONTRACT_ADDRESS,
			abi: LERP_TOKEN_ABI,
			functionName: 'stakeTokensToRealm',
			args: [stakeRealmId, stakeAmount],
		});
	}, [stakingStatus, stakeAmount, stakeRealmId, writeStake, setError, clearError]);

	useEffect(() => {
		if (isStakeSuccess && stakingStatus === 'staking') {
			setStakingStatus('success');
			refetchBalance();
			refetchAllowance();
		}
	}, [isStakeSuccess, stakingStatus, refetchBalance, refetchAllowance]);

	const resetStakingStatus = useCallback(() => {
		setStakingStatus('idle');
		setStakeAmount(BigInt(0));
		setStakeRealmId(null);
		clearError();
	}, [clearError]);

	// --- Buy Tokens Function ---
	const buyTokens = useCallback(async (lftAmountString: string) => {
		clearError();
		if (!salePriceData) { setError(new Error("Sale price not loaded yet.")); return; }
		if (!isConnected || !accountAddress) { setError(new Error("Wallet not connected.")); return; }
		try {
			const lftAmount = parseUnits(lftAmountString, 18);
			if (lftAmount <= BigInt(0)) throw new Error("Buy amount must be positive.");
			const salePrice = BigInt(salePriceData.toString());
			const costInWei = (lftAmount * salePrice) / parseUnits("1", 18);
			writeBuy({
				address: LERP_TOKEN_CONTRACT_ADDRESS,
				abi: LERP_TOKEN_ABI,
				functionName: 'buyTokens',
				args: [lftAmount],
				value: costInWei,
			});
		} catch (e) { setError(e); }
	}, [salePriceData, isConnected, accountAddress, writeBuy, setError, clearError]);

	useEffect(() => {
		if (isBuySuccess) {
			refetchBalance();
		}
	}, [isBuySuccess, refetchBalance]);

	// --- Format Data ---
	const balance = balanceData ? formatUnits(balanceData, 18) : '0';
	const salePrice = salePriceData ? formatUnits(salePriceData, 18) : 'N/A';
	const availableTokens = availableTokensData ? formatUnits(availableTokensData, 18) : 'N/A';
	const currentAllowance = allowanceData ? allowanceData : BigInt(0);

	// --- Refetch All ---
	const refetchAll = useCallback(() => {
		refetchBalance();
		refetchAllowance();
		refetchSalePrice();
		refetchAvailableTokens();
	}, [refetchBalance, refetchAllowance, refetchSalePrice, refetchAvailableTokens]);

	return {
		// Data
		userLftBalance: balance,
		currentAllowance,
		salePricePerLft: salePrice,
		availableTokensForSale: availableTokens,
		isConnected,
		accountAddress,

		// Buy Functionality
		buyTokens,
		buyIsLoading: isBuying || isConfirmingBuy,
		buyIsSuccess: isBuySuccess,
		buyTransactionHash: buyHash,

		// Staking Functionality
		initiateStakingProcess,
		approveStake,
		executeStake,
		resetStakingStatus,
		stakingStatus,
		stakeIsApproving: isApproving || isConfirmingApproval,
		stakeIsStaking: isStaking || isConfirmingStake,
		stakeIsSuccess: isStakeSuccess,
		stakeApprovalTxHash: approveHash,
		stakeTxHash: stakeHash,
		stakeAmount: stakeAmount,

		// Actions
		refetchUserBalance: refetchBalance,
		refetchAllowance: refetchAllowance,
		refetchSalePrice: refetchSalePrice,
		refetchAvailableTokens: refetchAvailableTokens,
		refetchAll,
	};
}