import Link from "next/link"




export function DashRealmCard({ config, children }: { config: any, children?: React.ReactNode }) {
	const realmImagePreview = config.media.static ? config.media.static.src : undefined
	return <div className="w-full h-32em bg-black rounded-2xl flex flex-col gap-6 p-8 text-white ">
		<div className="flex flex-row gap-2 justify-between w-full px-4">
			<div className="uppercase text-yellow-400 font-bold">
				{config.name}
			</div>
			<div>
				{config.currentVersion}
			</div>
		</div>
		<div className="w-full h-32 rounded-2xl object-cover bg-indigo-600 justify-center px-10 items-center content-center flex">
			<img src={realmImagePreview} alt="Realm Image" className="w-full" />
		</div>

		{children ? children : config.stats.map(({ name, value }: { name: string, value: string }) => {
			return <div key={name} className="flex flex-row gap-2 justify-between w-full px-2">
				<div className="w-auto text-gray-400">{name}</div>
				<div className="w-auto text-white">{value}</div>
			</div>
		})}
	</div>

}