'use client';

import { PANEL, STYLE } from "@/enums";
import { usePanel } from "@/hooks/usePanel";
import { useAccount } from "wagmi";
import cn from "classnames";

export function RealmActions({ realmId }: { realmId: string }) {
	{/* Sticky Footer Buttons */ }
	const { navToPanel } = usePanel();
	const { isConnected } = useAccount();



	return <div className="flex flex-row justify-center items-center w-full gap-10">
		<button
			onClick={() => navToPanel(PANEL.STAKE)}
			className={cn(STYLE.YELLOW_BUTTON, 'justify-center text-sm h-14 px-10')} // Adjusted height
		>
			Stake
		</button>
		<button
			onClick={() => navToPanel(PANEL.CLAIM)}
			className={cn(STYLE.GREEN_BUTTON, 'justify-center text-sm h-14 px-10')} // Use PURPLE_BUTTON, adjusted height
		>
			{isConnected ? "Claim" : "Connect to claim"}
		</button>
	</div>

}