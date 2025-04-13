import { DashRealmCard } from "./DashRealmCard";
import classNames from "classnames";
import { getPublicLerpConfig } from "@/hooks/getPublicLerpConfig";
import Link from 'next/link'; // Import Link
import { StatEntrySection } from "./StatEntry";

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
	const config = getPublicLerpConfig();

	// if (data.error && !data.config) {
	// 	return <div className={classNames('w-full flex flex-col gap-8 p-8')}>
	// 		<div className="text-gray-400 w-full justify-between flex flex-row font-mono"> {/* Added font-mono */}
	// 			Realms:

	// 		</div>
	// 		<div className="bg-red-500 text-white rounded-xl p-4">FAILED TO CONNECT TO LERP API</div>
	// 	</div>
	// }

	const label = <div className="text-gray-400 w-full justify-between flex flex-row font-mono"> {/* Added font-mono */}
		Realms:
		<span className='font-bold text-black'>{config.realms.length}</span>
	</div>


	return (
		<StatEntrySection label={label}>
			<div className={classNames('w-full flex flex-col gap-8 ')}>
				{config.realms.map((realm: any) => <DashRealmCard key={realm.id} config={realm} />)}
			</div>
		</StatEntrySection>

	);
}