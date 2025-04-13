'use client';
import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";

interface UseAccountStakeInfoProps {
	accountAddress: string | null | undefined;
}

// remove type from here, move to @lerp/contracts
interface StakerDetails {
	address: Address;
	totalStaked: string; // Keep as string as it comes from API/hook potentially
	realms: {
		[realmId: number]: {
			totalStaked: string; // Stringified bigint
			latestUnlockTime: number;
		}
	};
}

export function useAccountStakeInfo({ accountAddress }: UseAccountStakeInfoProps) {
	const query = useQuery<StakerDetails>({
		queryKey: ['accountStakeInfo', accountAddress],
		queryFn: async () => {
			if (!accountAddress) {
				return null;
			}
			const response = await fetch(`/api/accountStakeInfo?accountAddress=${accountAddress}`);
			const data = await response.json();
			return data.stakeInfo ?? null;
		},
	});

	return query;
}