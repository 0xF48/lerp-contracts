'use client';
import '@rainbow-me/rainbowkit/styles.css';
import {
	getDefaultConfig,
	RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
	hardhat
} from 'wagmi/chains';
import {
	QueryClientProvider,
	QueryClient,
} from "@tanstack/react-query";


const queryClient = new QueryClient({})
import { createConfig, http } from 'wagmi'


declare module 'wagmi' {
	interface Register {
		config: typeof wagmiConfig
	}
}

export const wagmiConfig = createConfig({
	chains: [hardhat],
	transports: {
		[hardhat.id]: http(),
	},
	ssr: true
})



export function DappProvider({ children }: { children: React.ReactNode }) {
	return (
		<WagmiProvider config={wagmiConfig}>
			<QueryClientProvider client={queryClient}>
				<RainbowKitProvider>
					{children}
				</RainbowKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}