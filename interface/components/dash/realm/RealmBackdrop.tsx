import React from 'react';
import cn from 'classnames';
import { getPublicRealmData } from '@/hooks/getPublicRealmData'; // To fetch config
import { getAPIAssetPath } from '@/hooks/getAPIAssetPath'; // To construct URL

interface RealmBackdropProps {
	realmId: string;
	className?: string; // Allow passing additional classes
}

// Note: This component fetches data server-side if used in an async Server Component parent.
// If used in a Client Component parent, data fetching might need adjustment (e.g., useEffect + useState or a client-side hook).
export async function RealmBackdrop({ realmId, className }: RealmBackdropProps) {
	// Fetch realm config to get the *background* image URL
	// We only need config here
	const { realmConfig } = await getPublicRealmData(realmId);

	// Use the background image source from media.static.src
	if (!realmConfig?.media?.static?.src) {
		console.warn(`RealmBackdrop: Missing media.static.src for realmId ${realmId}`);
		return null; // Return null if no background image source
	}

	const realmBackgroundImageUrl = getAPIAssetPath(realmConfig.media.static.src);

	return (
		<div
			className={cn(
				"absolute top-0 left-0 w-full max-h-[30rem] h-[50vh]", // Positioning and max height (using vh as fallback)
				"bg-cover bg-center bg-no-repeat", // Background properties
				"opacity-20 pointer-events-none z-0", // Appearance and layering (adjust opacity as needed)
				className // Merge additional classes
			)}
			style={{ backgroundImage: `url(${realmBackgroundImageUrl})` }} // Correct variable name
			aria-hidden="true"
		>
			{/* Gradient Overlay - Fades to page background */}
			<div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--background)]"></div> {/* Added gradient */}
		</div>
	);
}