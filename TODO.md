- finish all compute functions
	- stakes get computed and saved first
	- then claims get computed and saved, claims depend on the last stake result,
	- claims compute should go through all realm transactions since last ClaimsComputeResult (both deposits and withdrawals) and use output of last StakesComputeResult and last ClaimsComputeResult
	to compute how much is owed to each staker. this data is then available to query via graphql.