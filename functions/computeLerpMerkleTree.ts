/**
* reads lerp founder token holdings for each realm.
* computes the payout merkel tree for each realm using transaction data.
* stores the payout amounts in db.
* updates all realm contracts using the payout admin account.
* deploys the cron job to vercel.
* account holder must have enough money in their wallet for all realms in 
* order to pay the gas required to update each supported realms merkel tree.
* once merkel tree is updated, holders may view their payout figures from cache
* and claim their payout for each realm individually in the currency of 
* of the realms chain native token.
**/

export function computePayout() {

}