import { getPublicRealmData } from "@/hooks/getPublicRealmData";
import { StatEntry, StatEntrySection } from "../StatEntry";


export async function RealmStats({ realmId }: { realmId: string }) {

	const { realmConfig, realmStatus, error } = await getPublicRealmData(realmId);
	console.log(realmStatus)


	return <StatEntrySection label={realmConfig.name + ' stats'}>
		<StatEntry label="Version" >
			{realmConfig.currentVersion}
		</StatEntry>
	</StatEntrySection>

}