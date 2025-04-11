'use client';

import React, { useState, useMemo, useEffect } from 'react';
import cn from "classnames";
import { usePanel, PanelContext } from '../../hooks/usePanel'; // Relative path
import { PANEL, STYLE } from '../../enums'; // Relative path
import { useLerpToken } from '../../hooks/useLerpToken'; // Relative path
import { formatUnits, parseUnits } from 'viem';
import { useAccount } from 'wagmi';
import { ArrowLeftIcon, CheckIcon, LoaderIcon, MinusIcon, PlusIcon } from 'lucide-react';
import { useErrorHandler } from '../../contexts/ErrorHandlerContext'; // Relative path
// Use @root alias to import from config directory at the project root
import { CONFIG } from '../../../config';

export function StakePanelContent() {
	const { currentRealmId, hidePanel, currentPanel } = usePanel(); // Removed currentRealmName
	const { address: accountAddress, isConnected } = useAccount();
	const { setError } = useErrorHandler();
	const {
		userLftBalance,
		initiateStakingProcess,
		approveStake,
		executeStake,
		resetStakingStatus,
		stakingStatus,
		stakeIsApproving,
		stakeIsStaking,
		stakeIsSuccess,
		stakeApprovalTxHash,
		stakeTxHash,
		stakeAmount,
		refetchUserBalance,
	} = useLerpToken();

	const [stakeAmountLft, setStakeAmountLft] = useState('1');

	// Find realm name from config based on currentRealmId
	const currentRealmName = useMemo(() => {
		if (!currentRealmId) return 'Unknown Realm';
		const realmIdNum = Number(currentRealmId);
		// Use LOCAL_LERP_PUBLIC_CONFIG imported from @root
		const realm = CONFIG.realms.find(r => r.stakeRealmId === realmIdNum);
		return realm ? realm.name : 'Unknown Realm';
	}, [currentRealmId]);

	useEffect(() => {
		if (currentPanel !== PANEL.STAKE && stakingStatus !== 'idle') {
			resetStakingStatus();
			setStakeAmountLft('1');
		}
	}, [currentPanel, stakingStatus, resetStakingStatus]);

	useEffect(() => {
		if (stakeIsSuccess) {
			refetchUserBalance();
		}
	}, [stakeIsSuccess, refetchUserBalance]);

	const handleAmountChange = (increment: number) => {
		setStakeAmountLft(prev => {
			const current = parseInt(prev, 10) || 0;
			const next = Math.max(1, current + increment);
			return next.toString();
		});
	};
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (value === '' || /^\d+$/.test(value)) {
			if (value === '0') setStakeAmountLft(value);
			else setStakeAmountLft(value.replace(/^0+(?!$)/, ''));
		}
	};
	const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		const value = parseInt(e.target.value, 10);
		if (isNaN(value) || value <= 0) setStakeAmountLft('1');
		else setStakeAmountLft(value.toString());
	};

	const handleNextFromInput = () => {
		if (!currentRealmId) {
			setError(new Error("Cannot initiate stake: Realm ID is missing."));
			console.error("StakePanel: currentRealmId is missing.");
			return;
		}
		const realmIdNumber = Number(currentRealmId);
		if (isNaN(realmIdNumber) || realmIdNumber <= 0) {
			setError(new Error(`Invalid Realm ID: ${currentRealmId}`));
			console.error("StakePanel: Invalid currentRealmId:", currentRealmId);
			return;
		}
		const amountNum = parseInt(stakeAmountLft, 10);
		if (isNaN(amountNum) || amountNum <= 0) {
			setError(new Error("Please enter a valid whole number amount (at least 1)."));
			setStakeAmountLft('1');
			return;
		}
		const balanceNum = parseFloat(userLftBalance);
		if (isNaN(balanceNum) || amountNum > balanceNum) {
			setError(new Error("Insufficient LFT balance."));
			return;
		}
		initiateStakingProcess(realmIdNumber, stakeAmountLft);
	};

	const handleBack = () => {
		resetStakingStatus();
	};

	// --- Render Logic ---
	const renderInputStep = () => (
		<>
			<h3 className="text-xl font-bold mb-4 text-center">Set Stake Amount</h3>
			<div className="text-sm mb-1 text-center">Available: {userLftBalance} $LFT</div>
			<div className="flex flex-col gap-3">
				<div className="flex items-center justify-between bg-yellow-500/20 p-4 rounded-lg border border-yellow-600">
					<input
						type="text"
						inputMode="numeric"
						pattern="\d*"
						value={stakeAmountLft}
						onChange={handleInputChange}
						onBlur={handleInputBlur}
						placeholder="1"
						className={cn(STYLE.INPUT_FIELD, "text-black text-2xl")}
					/>
					<span className="text-black text-sm ml-2 whitespace-nowrap">/ {userLftBalance}</span>
				</div>
				<div className="flex justify-end gap-3">
					<button onClick={() => handleAmountChange(-1)} className="bg-yellow-500/50 p-2 rounded-md hover:bg-yellow-500 active:bg-yellow-600 transition-colors disabled:opacity-50" disabled={parseInt(stakeAmountLft, 10) <= 1}>
						<MinusIcon size={20} className="text-black" />
					</button>
					<button onClick={() => handleAmountChange(1)} className="bg-yellow-500/50 p-2 rounded-md hover:bg-yellow-500 active:bg-yellow-600 transition-colors">
						<PlusIcon size={20} className="text-black" />
					</button>
				</div>
			</div>
			<div className="flex-grow"></div>
			<button onClick={handleNextFromInput} className={cn(STYLE.BLACK_BUTTON, 'w-full')}>Next</button>
		</>
	);

	const renderConfirmStep = () => (
		<>
			<button onClick={handleBack} className={cn(STYLE.STONE_BUTTON, 'absolute top-4 left-4 h-8 px-2 text-xs')}>
				<ArrowLeftIcon size={16} className="mr-1" /> Back
			</button>
			<h3 className="text-xl font-bold mb-2 text-center pt-8">Confirm Stake</h3>
			{/* Use derived currentRealmName */}
			<p className="text-center">You are about to stake <span className='font-bold'>{formatUnits(stakeAmount, 18)} $LFT</span> into the <span className='font-bold'>{currentRealmName}</span> realm.</p>
			<p className='text-sm mt-2 text-center'>Your stake will expire in approx. 90 days.</p>
			<div className='text-xs mt-4 bg-yellow-500/20 p-3 rounded border border-yellow-600 text-yellow-700'>
				Once your stake expires you have 30 days to re-stake or withdraw before you will be automatically restaked for 90 days. Expired stakes do NOT earn rewards - keep your stake locked for longer to avoid missed rewards and gas fees.
			</div>
			<div className="flex-grow"></div>
			{stakingStatus === 'needs_approval' && (
				<button onClick={approveStake} disabled={stakeIsApproving} className={cn(STYLE.YELLOW_BUTTON, 'w-full')}>
					{stakeIsApproving ? 'Approving...' : 'Approve LFT First'}
				</button>
			)}
			{stakingStatus === 'ready_to_stake' && (
				<button onClick={executeStake} disabled={stakeIsStaking} className={cn(STYLE.BLACK_BUTTON, 'w-full')}>
					{stakeIsStaking ? 'Staking...' : 'Stake Now'}
				</button>
			)}
			{(stakingStatus === 'checking_allowance') && (
				<button disabled className={cn(STYLE.BLACK_BUTTON, 'w-full opacity-50 flex items-center justify-center gap-2')}>
					<LoaderIcon size={16} className="animate-spin" />
					Checking Allowance...
				</button>
			)}
		</>
	);

	const renderTransactionStep = () => (
		<>
			<button onClick={handleBack} className={cn(STYLE.STONE_BUTTON, 'absolute top-4 left-4 h-8 px-2 text-xs')}>
				<ArrowLeftIcon size={16} className="mr-1" /> Back
			</button>
			<div className="flex flex-col items-center justify-center h-full gap-4">
				<LoaderIcon size={40} className="animate-spin text-yellow-600" />
				{stakingStatus === 'approving' && <p>Waiting for Approval...</p>}
				{stakingStatus === 'staking' && <p>Staking {formatUnits(stakeAmount, 18)} $LFT...</p>}
				{stakeApprovalTxHash && stakingStatus === 'approving' && <p className='text-xs mt-2 break-all'>Approval Tx: {stakeApprovalTxHash}</p>}
				{stakeTxHash && stakingStatus === 'staking' && <p className='text-xs mt-2 break-all'>Stake Tx: {stakeTxHash}</p>}
			</div>
		</>
	);

	const renderSuccessStep = () => (
		<>
			<div className="flex flex-col items-center justify-center h-full gap-4 text-center">
				<CheckIcon size={40} className="text-green-500" />
				<h3 className="text-xl font-bold text-green-600">Stake Successful!</h3>
				{/* Use derived currentRealmName */}
				<p>You successfully staked {formatUnits(stakeAmount, 18)} $LFT into {currentRealmName}.</p>
				{stakeTxHash && <p className='text-xs mt-2 break-all'>Tx: {stakeTxHash}</p>}
				<button onClick={() => { hidePanel(); resetStakingStatus(); }} className={cn(STYLE.BLACK_BUTTON, 'w-full mt-6')}>Done</button>
			</div>
		</>
	);

	return (
		<div className={'w-full h-full text-black p-6 flex flex-col gap-4 font-mono relative'}>
			{(stakingStatus === 'idle' || stakingStatus === 'error') && renderInputStep()}
			{(stakingStatus === 'checking_allowance' || stakingStatus === 'needs_approval' || stakingStatus === 'ready_to_stake') && renderConfirmStep()}
			{(stakingStatus === 'approving' || stakingStatus === 'staking') && renderTransactionStep()}
			{stakingStatus === 'success' && renderSuccessStep()}
		</div>
	);
}