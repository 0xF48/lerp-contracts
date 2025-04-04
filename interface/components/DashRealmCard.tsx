import { getAPIAssetPath } from "@/hooks/getAPIAssetPath"


export function DashRealmCard({ config, children }: { config: any, children?: React.ReactNode }) {
	const realmImagePreview = config.media.static ? getAPIAssetPath(config.media.static.src) : undefined
	const realmBannerPreview = config.bannerUrl ? getAPIAssetPath(config.bannerUrl) : undefined


	return <div className="w-full h-32em bg-black rounded-2xl flex flex-col gap-6 p-8 text-white ">
		<div className="flex flex-row gap-2 justify-between w-full px-4">
			<div className="uppercase text-yellow-400 font-bold">
				{config.name}
			</div>
			<div>
				{config.currentVersion}
			</div>
		</div>
		<div className="relative w-full h-32 rounded-2xl object-cover bg-indigo-600 justify-center items-center content-center flex overflow-hidden">
			<img src={realmImagePreview} alt="Realm Image" className="w-full" />
			<div className="z-10 w-full h-full absolute left-0 top-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.8)_0%,rgba(73,90,117,0.0)_70%)]"></div>
			<div className="z-20 absolute left-0 top-0 w-full h-full flex items-center justify-center px-12">
				<img src={realmBannerPreview} alt="Realm Banner" className="relative" />
			</div>
		</div>

		{/* {children ? children : config.stats.map(({ name, value }: { name: string, value: string }) => {
			return <>
				<div key={name} className="flex flex-row gap-2 justify-between w-full px-2">
					<div className="w-auto text-gray-400">{name}</div>
					<div className="w-auto text-white">{value}</div>
				</div>

			</>

		})} */}

	</div >

}