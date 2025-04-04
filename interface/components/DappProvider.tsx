'use client';
import '@rainbow-me/rainbowkit/styles.css';
import {
	getDefaultConfig, // Keep if needed for RainbowKit defaults elsewhere
	RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { hardhat } from 'wagmi/chains'; // Import base hardhat chain for convenience
import {
	QueryClientProvider,
	QueryClient,
} from "@tanstack/react-query";
import { createConfig, http } from 'wagmi';

// Define the local Hardhat node explicitly
const localHardhat = {
	...hardhat, // Spread default hardhat properties
	id: 31337, // Ensure correct chain ID
	name: 'Local Hardhat Node',
	rpcUrls: {
		default: {
			http: ['http://127.0.0.1:8545'], // Explicitly set RPC URL
		},
	},
} as const; // Use 'as const' for type safety

const queryClient = new QueryClient({});

declare module 'wagmi' {
	interface Register {
		config: typeof wagmiConfig
	}
}

export const wagmiConfig = createConfig({
	chains: [localHardhat], // Use the explicitly defined localHardhat chain
	transports: {
		[localHardhat.id]: http(), // Use the explicit URL defined in localHardhat
	},
	ssr: true // Keep SSR enabled if needed
});


export function DappProvider({ children }: { children: React.ReactNode }) {
	return (
		<WagmiProvider config={wagmiConfig}>
			<QueryClientProvider client={queryClient}>
				{/* Ensure RainbowKitProvider uses the same config or is compatible */}
				<RainbowKitProvider>
					{children}
				</RainbowKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}