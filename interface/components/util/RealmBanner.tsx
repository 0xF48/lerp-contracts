import { getAPIAssetPath } from "@/hooks/getAPIAssetPath";

import { getPublicRealmData } from "@/hooks/getPublicRealmData";

export async function RealmBanner({ realmId }: { realmId: string }) {
	const { realmConfig } = await getPublicRealmData(realmId);

	const realmImagePreview = getAPIAssetPath(realmConfig.media.static.src);
	const realmBannerPreview = getAPIAssetPath(realmConfig.bannerUrl);

	return <div className="relative w-full h-32 rounded-xl object-cover bg-indigo-900 justify-center items-center content-center flex overflow-hidden max-w-md"> {/* Adjusted bg */}
		{realmImagePreview && <img src={realmImagePreview} alt="Realm Background" className="absolute inset-0 w-full h-full object-cover opacity-30" />} {/* Background image */}
		<div className="z-10 w-full h-full absolute left-0 top-0 bg-gradient-to-t from-black/50 to-transparent"></div> {/* Gradient overlay */}
		{realmBannerPreview && (
			<div className="z-20 relative flex items-center justify-center px-6"> {/* Adjusted padding */}
				<img src={realmBannerPreview} alt={`${realmConfig.name} Banner`} className="max-h-16 object-contain" /> {/* Constrained banner height */}
			</div>
		)}
	</div>
}