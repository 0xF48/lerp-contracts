'use client'

import { STYLE } from "@/enums";
import cn from "classnames";
import { DeleteIcon, XIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";





export function DashNote({ onClose }: { onClose?: () => void }) {
	const { address: accountAddress, isConnected } = useAccount();
	if (isConnected && accountAddress) {
		return null
	}
	return (
		<div className={" text-black relative w-full py-10 px-10 pt-15 " + STYLE.BORDER_DASHED_BOT}>
			Hey stranger, I’m glad you found your way to the $LFT Profit Sharing Dashboard! Here You can BUY LFT tokens and stake them into realms and earn daily dividends - money earned directly from in-game transactions. Just watch this video and don’t forget to stake for the upcoming podrun realm as soon as you BUY to start earning.
			<br />
			<hr className="my-4" />
			Yury Sidorov
			<br />
			CEO/Founder of Lerp

		</div>
	)
}