import useSWR from "swr";

export function useTokenDistributionStats() {

	return {
		isLoading: false,
		data: [
			{
				name: 'Total Supply',
				value: 17_000,
				value_str: '17,000',
			},
			{
				name: 'Total Distributed',
				value: 1_000,
				value_str: '1,000',
			},
			{
				name: 'Total Staked',
				value: 2_210.41,
				value_str: '2,210.41',
			}
		]
	}
}