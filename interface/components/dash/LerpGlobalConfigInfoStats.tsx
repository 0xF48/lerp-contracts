import { getPublicLerpStatus } from "@/hooks/getPublicLerpStatus";
import { StatEntry, StatEntrySection } from "./StatEntry";
import Link from "next/link";
import classNames from "classnames";
import { STYLE } from "@/enums";
import { CONFIG } from "@lerp/contracts";

export function firstAndLast(str, n, n2) {
	return str.slice(0, n) + '..' + str.slice(-(n2 || n));
}


export async function LerpGlobalConfigInfoStats() {
	const config = CONFIG

	return <StatEntrySection label={<Link href={'/api/config'} className={classNames(STYLE.LINK_BLACK_TEXT)}>$LFT Details</Link>}>
		<StatEntry label="Token Address" >
			{firstAndLast(config.tokenInfo.address, 5, 5)}
		</StatEntry>
		<StatEntry label="Token Chain" >
			{config.tokenInfo.chain}
		</StatEntry>
		<StatEntry label="Total Supply" >
			{config.tokenInfo.totalSupply}
		</StatEntry>
		<StatEntry label="Stake Lock Period" >
			{config.tokenInfo.stakeLockDaysAmount} days
		</StatEntry>

	</StatEntrySection >
}