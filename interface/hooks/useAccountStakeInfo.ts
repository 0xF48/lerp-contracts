'use client';
import { useQuery } from "@tanstack/react-query";

interface UseAccountStakeInfoProps {
	accountAddress: string | null | undefined;
}

export function useAccountStakeInfo<T>({ accountAddress }: UseAccountStakeInfoProps) {
	const query = useQuery<T>({
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