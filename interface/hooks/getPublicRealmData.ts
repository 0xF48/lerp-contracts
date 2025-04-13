import { real } from "viem/chains";
import { getPublicLerpConfig } from "./getPublicLerpConfig";
import { getPublicLerpStatus } from "./getPublicLerpStatus";
import { PublicRealmConfig } from "@lerp/contracts";

export async function getPublicRealmData(realmId: string): Promise<{
	error: any | null
	realmConfig: PublicRealmConfig | null
	realmStatus: any | null
}> {
	const config = getPublicLerpConfig()
	const { error: statusError, status } = await getPublicLerpStatus()

	if (!config) {
		return {
			error: new Error("Lerp public config not found"),
			realmConfig: null,
			realmStatus: null,
		}
	}

	if (!status) {
		return {
			error: new Error("Lerp public status not found"),
			realmConfig: null,
			realmStatus: null,
		}
	}

	let realmConfig = config.realms.filter((realm: any) => realm.id === realmId)[0]
	let realmStatus = status.globalMetrics.realms[realmId]


	if (!realmStatus) {
		return {
			error: new Error(`Realm [${realmId}] status not found`),
			realmConfig: realmConfig,
			realmStatus: null,
		}
	}

	if (!realmConfig) {
		return {
			error: new Error(`Realm [${realmId}] config not found`),
			realmConfig: null,
			realmStatus: realmStatus,
		}
	}

	return {
		error: null,
		realmConfig: realmConfig,
		realmStatus: realmStatus,
	}
}