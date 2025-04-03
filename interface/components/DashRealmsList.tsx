import process from "node:process"
import { DashRealmCard } from "./DashRealmCard"
import classNames from "classnames"
import { STYLE } from "@/enums"
import Link from "next/link"




const TEST_DATA = [
	{
		name: 'podrun',
		id: 'podrun',
		bannerUrl: 'https://lerp.io/assets/realms/podrun/podrun.png',
		media: {
			static: {
				src: 'https://lerp.io/assets/realms/podrun/reel-1.jpg'
			}
		},
		currentVersion: 'v0.1',
		stats: [
			{
				name: 'staked',
				value: '1000'
			},
			{
				name: 'players',
				value: '100'
			},
		]
	}
]


export async function DashRealmsList() {
	const realms = TEST_DATA
	return (
		<div className={classNames('w-full flex flex-col gap-8 p-8')}>
			<div className="text-gray-400">realms:</div>
			{realms.map((realm, index) => {
				return <Link key={realm.id} href={'/realm/' + realm.id} className="hover:ring-4  hover:ring-yellow-400 transition-all rounded-2xl">
					<DashRealmCard config={realm} />
				</Link>
			})}
		</div>
	)
}