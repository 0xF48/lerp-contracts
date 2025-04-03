'use client'

import { STYLE } from "@/enums";
import cn from "classnames";
import { DeleteIcon, XIcon } from "lucide-react";
import { useState, useEffect } from "react";





export function DashNote({ onClose }: { onClose?: () => void }) {
	// Initialize state without accessing localStorage directly
	const [closed, setClosed] = useState(true);

	// Check localStorage only after mounting on the client
	useEffect(() => {
		const isClosed = localStorage.getItem('noteClosed') === 'true';
		if (isClosed) {
			setClosed(true);
		}
	}, []); // Empty dependency array ensures this runs only once on mount

	if (closed) {
		return null;
	}
	return (
		<div className={" text-black relative w-full py-10 px-10 pt-15" + STYLE.BORDER_DASHED_BOT}>
			<button onClick={() => {
				setClosed(true)
				localStorage.setItem('noteClosed', 'true')
			}} className={cn(STYLE.PALE_BUTTON_CHIP, 'p2 absolute right-0 top-4 w-12 p-0')}><XIcon className="w-32" stroke="black" /></button>
			Hey stranger, I’m glad you found your way to the $LFT Profit Sharing Dashboard! Here You can buy LFT tokens and stake them into realms and earn daily dividends - money earned directly from in-game transactions. Just watch this video and don’t forget to stake for the upcoming podrun realm as soon as you buy to start earning.

			-Yury Sidorov
			CEO/Founder of Lerp
		</div>
	)
}