'use client'
import { STYLE } from "@/enums";
import { PublicRealmConfig } from "@lerp/contracts";
import cn from 'classnames'
import { RealmStakeCard } from "./RealmStakeCard";
import { useAccount } from "wagmi";

export function RealmDetailsAccountContent({ realmConfig }: { realmConfig: PublicRealmConfig }) {
	const { address } = useAccount()
	if (!address) {
		return <div className={cn(STYLE.BORDER_DASHED_LEFT, 'flex flex-col w-full p-8 gap-10')}>
			connect wallet to view actions
		</div>
	}

	return <div className={cn(STYLE.BORDER_DASHED_LEFT, 'flex flex-col w-full p-8 gap-10')}>
		<RealmStakeCard realmConfig={realmConfig} />
	</div>
}