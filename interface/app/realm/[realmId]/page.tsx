import { ArrowUp, ArrowUpIcon, ChevronLeftIcon } from "lucide-react";
import { NAV, PANEL, STYLE } from "@/enums";

import AccountBalanceButton from "@/components/AccountBalanceButton";
import cn from "classnames";
import { getRealmInfo } from "@/hooks/getRealmInfo";
import { DashRealmCard } from "@/components/DashRealmCard";
import Link from "next/link";
import { AnimatedLerpLogo } from "@/components/AnimatedLerpLogo";
import { usePanel } from "@/hooks/usePanel";
import { StakePanelButton } from "@/components/panels/StakePanel";
import { ClaimPanelButton } from "@/components/panels/ClaimPanel";




// This is a Server Component
export default async function realmIdPage({ params }: any) {
	// Read the README.md file
	const { realmId } = await params
	const realmInfo = await getRealmInfo(realmId)



	return (
		<>




			<div className={STYLE.PAGE_NAV}>
				<Link href={NAV.DASH} className={cn(STYLE.BLACK_BUTTON, 'w-fit')}>
					<ChevronLeftIcon className={cn(STYLE.BUTTON_ICON, 'h-5 w-5')} />
					Dash
				</Link>
				<AccountBalanceButton />
			</div>
			<div className={STYLE.PAGE_CONTENT}>
				<div className="w-full flex items-center justify-center py-10">
					<div className="flex flex-col gap-8 items-center">
						<AnimatedLerpLogo />
						<h1 className="text-2xl  text-gray-400">Realm /<span className="text-black font-bold ml-4 uppercase">{realmId}</span></h1>
					</div>
				</div>
				<div className={cn(STYLE.BORDER_DASHED_TOP, 'w-full flex flex-col md:flex-row')}>
					<div className="w-full flex flex-col gap-10 p-8">
						<DashRealmCard config={realmInfo}>
							<div className="flex flex-col gap-2 justify-between w-full px-4">
								<a href='/' className="text-white underline hover:text-green-400">source</a>
								<a href='/' className="text-white underline hover:text-green-400">explorer</a>
							</div>
							<div className="w-full flex  justify-between items-center px-2 flex-row-reverse pt-6">
								<div className="flex flex-row gap-4 items-center">
									<div className="text-yellow-400 text-xl font-l">0.0%</div>
									<StakePanelButton />
									<div className={STYLE.BLACK_BUTTON}><ArrowUpIcon className="stroke-white" /></div>
								</div>

							</div>
						</DashRealmCard>
					</div>
					<div className={cn(STYLE.BORDER_DASHED_LEFT, 'p-10 w-full')}>
						{realmInfo.stats.map(({ name, value }: { name: string, value: string }) => {
							return <div key={name} className="flex flex-row gap-2 justify-between w-full px-2">
								<div className="w-auto text-gray-500">{name}</div>
								<div className="w-auto text-black">{value}</div>
							</div>
						})}
						<div>


						</div>
					</div>
				</div>
				<div className="w-full p-10 flex items-center justify-center">
					<ClaimPanelButton />
				</div>



			</div>






		</>
	);
}
