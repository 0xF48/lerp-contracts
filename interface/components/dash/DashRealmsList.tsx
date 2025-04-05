import { DashRealmCard } from "./DashRealmCard";
import classNames from "classnames";
import { getPublicLerpConfig } from "@/hooks/getPublicLerpConfig";
import Link from 'next/link'; // Import Link

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
	const data = await getPublicLerpConfig();

	if (data.error && !data.config) {
		return <div className={classNames('w-full flex flex-col gap-8 p-8')}>
			<div className="text-gray-400 w-full justify-between flex flex-row font-mono"> {/* Added font-mono */}
				Realms:

			</div>
			<div className="bg-red-500 text-white rounded-xl p-4">FAILED TO CONNECT TO LERP API</div>
		</div>
	}



	return (
		<div className={classNames('w-full flex flex-col gap-8 p-8')}>
			<div className="text-gray-400 w-full justify-between flex flex-row font-mono"> {/* Added font-mono */}
				Realms:
				<span className='font-bold text-black'>{data.config.realms.length}</span>
			</div>
			{data.error && <div className="bg-red-500 text-white rounded-xl p-4">FAILED TO CONNECT TO LERP API, USING CACHE, {data.error.message}</div>}

			{/* Render the array of Link-wrapped cards */}
			{data.config.realms.map((realm: any) => <DashRealmCard key={realm.id} config={realm} />)}
		</div>
	);
}