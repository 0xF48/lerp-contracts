'use client';

import { PANEL } from "../enums"; // Use relative path
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

// Update PanelContext type
export interface PanelContext {
	realmId?: string; // Keep realmId
	// realmName?: string; // Remove realmName
}

export function usePanel() {
	const router = useRouter();
	const pathname = usePathname(); // Get current pathname
	const searchParams = useSearchParams();

	// Read panel and realm context from URL
	const currentPanel = searchParams.get('panel') as PANEL | null; // Cast to PANEL enum
	const currentRealmId = searchParams.get('realmId') || undefined;
	// const currentRealmName = searchParams.get('realmName') || undefined; // Remove realmName reading

	const navToPanel = useCallback((panelEnum: PANEL, context?: PanelContext) => {
		console.log('navToPanel', panelEnum, context);
		const sp = new URLSearchParams(searchParams.toString());
		sp.set('panel', panelEnum);

		// Set realm context if provided
		if (context?.realmId) {
			sp.set('realmId', context.realmId);
		} else {
			sp.delete('realmId'); // Clear if not provided
		}
		// Remove realmName logic
		// if (context?.realmName) {
		//     sp.set('realmName', context.realmName);
		// } else {
		//     sp.delete('realmName');
		// }

		// Use pathname to preserve the current page route
		router.push(`${pathname}?${sp.toString()}`, { scroll: false });
	}, [router, searchParams, pathname]);

	const hidePanel = useCallback(() => {
		const sp = new URLSearchParams(searchParams.toString());
		sp.delete('panel');
		sp.delete('realmId'); // Also clear realm context when hiding
		// sp.delete('realmName'); // Remove realmName clearing
		router.push(`${pathname}?${sp.toString()}`, { scroll: false });
	}, [router, searchParams, pathname]);

	// --- Panel Specific Styling ---
	let panelOverlayColor = 'bg-black/90';
	if (currentPanel == PANEL.BUY) {
		panelOverlayColor = 'bg-blue-950/90';
	} else if (currentPanel == PANEL.STAKE) {
		panelOverlayColor = 'bg-yellow-950/90';
	} else if (currentPanel == PANEL.CLAIM) {
		panelOverlayColor = 'bg-green-950/90';
	}

	let panelBackgroundColor = 'bg-gray-800'
	let panelTitleColor = 'text-gray-800';
	if (currentPanel === PANEL.BUY) {
		panelBackgroundColor = 'bg-blue-500';
		panelTitleColor = 'text-blue-500';
	} else if (currentPanel === PANEL.STAKE) {
		panelBackgroundColor = 'bg-yellow-400';
		panelTitleColor = 'text-yellow-400';
	} else if (currentPanel === PANEL.CLAIM) {
		panelBackgroundColor = 'bg-green-500';
		panelTitleColor = 'text-green-500';
	}

	return {
		currentPanel,
		currentRealmId, // Expose realmId
		// currentRealmName, // Remove realmName exposure
		panelOverlayColor,
		panelBackgroundColor,
		panelTitleColor,
		navToPanel,
		hidePanel,
	};
}