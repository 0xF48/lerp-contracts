import { DashRealmCard } from "./DashRealmCard"
import classNames from "classnames"
import { getPublicLerpConfig } from "@/hooks/getPublicLerpConfig"




// const TEST_DATA = [
// 	{
// 		name: 'podrun',
// 		id: 'podrun',
// 		bannerUrl: 'https://lerp.io/assets/realms/podrun/podrun.png',
// 		media: {
// 			static: {
// 				src: 'https://lerp.io/assets/realms/podrun/reel-1.jpg'
// 			}
// 		},
// 		currentVersion: 'v0.1',
// 		stats: [
// 			{
// 				name: 'staked',
// 				value: '1000'
// 			},
// 			{
// 				name: 'players',
// 				value: '100'
// 			},
// 		]
// 	}
// ]


export async function DashRealmsList() {

	// const realms = TEST_DATA
	const config = await getPublicLerpConfig()

	const realms = config.realms.map((realm: any) => {
		return <DashRealmCard key={realm.id} config={realm} />
	})

	return (
		<div className={classNames('w-full flex flex-col gap-8 p-8')}>
			<div className="text-gray-400 w-full justify-between flex flex-row">
				Realms:
				<span className='font-bold text-black'>{realms.length}</span>
			</div>
			{realms}
		</div>
	)
}