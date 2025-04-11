// interface/components/dash/TokenDistributionStat.tsx
// This is the Server Component wrapper

import { getTokenDistributionStats } from "@/hooks/getTokenDistributionStats";
import { TokenDistributionStatClient } from "./TokenDistributionStatClient"; // Import the Client Component

// This component remains async and runs on the server
export async function TokenDistributionStat() {
	// Fetch data on the server
	const data = await getTokenDistributionStats();

	// Render the Client Component and pass the fetched data as props
	// The client component will handle state and interactivity
	return <TokenDistributionStatClient initialData={data} />;
}