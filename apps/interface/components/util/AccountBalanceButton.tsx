import { STYLE } from "@/enums";
import cn from "classnames";

import { ConnectButton } from '@rainbow-me/rainbowkit';

// export const YourApp = () => {
// 	return ;
// };


export default function AccountBalanceButton() {

	return <ConnectButton chainStatus="name" />



	return <div className={cn(STYLE.BLACK_BUTTON, 'w-64 justify-between')}>
		<span className="text-white/50">Balance</span>
		<span>0.0</span>
	</div>
}