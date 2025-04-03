
export async function getRealmInfo(realmId: string) {
	// const res = await fetch(`https://api.lerp.io/realms/${realmId}`, {
	// 	method: 'GET',
	// 	headers: {
	// 		'Content-Type': 'application/json',
	// 		'Accept': 'application/json',
	// 	},
	// });
	// if (!res.ok) {
	// 	throw new Error('Failed to fetch data');
	// }
	// const data = await res.json();
	const data = {
		id: 'podrun',
		name: 'Podrun',
		media: {
			static: {
				src: 'https://lerp.io/assets/realms/podrun/podrun.png'
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
			{
				name: 'worlds',
				value: '100'
			}
		]
	}

	return data;
}