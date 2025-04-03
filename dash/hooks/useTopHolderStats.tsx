

const TEST_DATA = [
	{
		address: '0x512',
		tokenAmount: 85.32
	},
	{
		address: '0x512',
		tokenAmount: 6.32
	},
	{
		address: '0x512',
		tokenAmount: 35.32
	},
	{
		address: '0x512',
		tokenAmount: 50.32
	},
	{
		address: '0x512',
		tokenAmount: 40.32
	},
	{
		address: '0x512',
		tokenAmount: 25.32
	},
	{
		address: '0x512',
		tokenAmount: 13.32
	},
	{
		address: '0x512',
		tokenAmount: 54.32
	},
	{
		address: '0x512',
		tokenAmount: 32.32
	},
	{
		address: '0x412',
		tokenAmount: 18.32
	}
]

export type TopHolderEntry = {
	address: string,
	tokenAmount: number
}

export function useTopHolderStats(): { isLoading: boolean, data?: TopHolderEntry[] } {
	return {
		isLoading: false,
		data: TEST_DATA
	}
}