import { getAPIAssetPath } from "@/hooks/getAPIAssetPath";
import { PublicRealmConfig } from "@/enums";

export function RealmBanner({ config }: { config: PublicRealmConfig }) {
	const realmImagePreview = config.media?.static?.src ? getAPIAssetPath(config.media.static.src) : undefined;
	const realmBannerPreview = config.bannerUrl ? getAPIAssetPath(config.bannerUrl) : undefined;

	return <div className="relative w-full h-32 rounded-xl object-cover bg-indigo-900 justify-center items-center content-center flex overflow-hidden"> {/* Adjusted bg */}
		{realmImagePreview && <img src={realmImagePreview} alt="Realm Background" className="absolute inset-0 w-full h-full object-cover opacity-30" />} {/* Background image */}
		<div className="z-10 w-full h-full absolute left-0 top-0 bg-gradient-to-t from-black/50 to-transparent"></div> {/* Gradient overlay */}
		{realmBannerPreview && (
			<div className="z-20 relative flex items-center justify-center px-6"> {/* Adjusted padding */}
				<img src={realmBannerPreview} alt={`${config.name} Banner`} className="max-h-16 object-contain" /> {/* Constrained banner height */}
			</div>
		)}
	</div>
}