import { getPublicLerpStatus } from "@/hooks/getPublicLerpStatus";
import { StatEntry, StatEntrySection } from "./StatEntry";
import Link from "next/link";
import classNames from "classnames";
import { STYLE } from "@/enums";
import { COMPUTE_COLLECTIONS, CONFIG, StakesComputeResult } from "@lerp/contracts";
import { firstAndLast } from "@/lib/firstAndLast";
import { getLastComputeResult } from "@/hooks/getLastComputeResult";
import { formatEther } from "viem";



export async function StakeComputeResultStats() {

	const res = await getLastComputeResult<StakesComputeResult>(COMPUTE_COLLECTIONS.StakesComputeResult)

	return <StatEntrySection label={"Stake Stats"}>

		<StatEntry label="Distributed Tokens" >
			{formatEther(BigInt(res.data.tokenStats.totalDistributed || '0'))}
		</StatEntry>

		<StatEntry label="Staked Tokens" >
			{formatEther(BigInt(res.data.tokenStats.totalStaked || '0'))}
		</StatEntry>


	</StatEntrySection >
}