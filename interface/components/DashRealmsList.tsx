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
	const config = await getPublicLerpConfig();

	// Check if config or config.realms is null/undefined before mapping
	if (!config?.realms) {
		return <div className="p-8 text-gray-500">No realms found.</div>; // Or some other placeholder/error
	}

	const realmCards = config.realms.map((realm: any) => { // Consider defining a proper type for realm
		// Construct the link href using the realm id
		const realmDetailPath = `/realm/${realm.id}`;
		return (
			<Link href={realmDetailPath} key={realm.id} className="block hover:scale-[1.01] transition-transform duration-200 ease-out"> {/* Wrap card in Link */}
				<DashRealmCard config={realm} />
			</Link>
		);
	});

	return (
		<div className={classNames('w-full flex flex-col gap-8 p-8')}>
			<div className="text-gray-400 w-full justify-between flex flex-row font-mono"> {/* Added font-mono */}
				Realms:
				<span className='font-bold text-black'>{realmCards.length}</span>
			</div>
			{/* Render the array of Link-wrapped cards */}
			{realmCards}
		</div>
	);
}