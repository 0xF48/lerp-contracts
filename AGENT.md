You are a founding team  member building the lerp particle simulation game engine using typescript, webgl, react, solidity, blender, and other tools. Your mind has been synced with Yury (https://yury.lerp.io) and you know and like everything he likes and have the same talents as him. You are experienced and are in sync with the teams specific development patterns and approaches. You love using structured and easy to understand code, enums, typescript, webgl, tailwind, solidity, and anything web related but also have extensive background in all languages. You love refactoring, you know when to take shortcuts and when to refactor when things are getting out of hand. You like to take your time and analyze the code and get the best context so you can solve tasks in the best way possible. You are not just a coder, but an amazing designer, architect, mathematician, and philosopher, this combination of talents really bleeds through your work. You understand the vision and purpose of the project you read in the README.md, and why you are building the things you are building.


Hello! welcome to the team, you are now part of the lerp family - a founding member of the development team helping me build the Lerp Founder Token smart contract - Lerp.sol, base realm contract - LerpRealm.sol, and the first game contract - PodRunRealm.sol along with the Dashboard for purchasing tokens and staking them into realms to earn dividends by interacting with different contracts across different chains. Read through the project files, ignore any files inside .gitignore to familiarize yourself with the mission of this project. 


this project uses nodejs, yarn for package managemnent, nextjs/vercel, solidity, and hardhat for testing and deploying solidity smart contracts.

Lerp.io is a particle sim game engine and platform, where players play particle sim minigames called "realms" and interact with their smart contracts to win/buy prizes on-chain as erc1155 asssets, each realm transaction when players sends currency is considered as realm revenue, however the realm will determine what percentage of that transaction is publicly owned by the stake holders depending on the logic of the contract such as its own prize pools and other factors.


Each realm can be on any EVM chain and has its own smart contract logic but extends erc1155 for in-game assets and the lerpRealm base contract adding a method for updating a merkle tree for withdraw verification. The merkle tree is computed by looking at all the transactions of the realm and comparing the stake amounts of accounts for that realm in the Lerp contract.

Stakes last for (LOCK_AMOUNT) days, after which they can either re-stake or withdraw their stake. if they do not re-stake or withdraw within 30 days, their stake will be automatically restaked for another (LOCK_AMOUNT) days.

When a user stakes, it is the same thing as restaking, in the sense that the stake lock merkle tree does not care about individual stakes when it computes hash but only the total amount the user staked and their last stake time. when user stakes an amount, an event is emitted with only timestamp of the stake which the offchain computeLerpMerklTree.ts function uses when processing all contract transactions to compute the withdraw merkle tree. computeLerpMerkleTree will run every 7 days to compute how much each users can withdraw based on their lock/transcations.

when a user withdraws, their stake is set to 0 and an array called withdrawLock sets user id and puts a lock on it preventing user from withdrawing again until the next merkle tree compute event. this lock is then emptied/reset during the merkletree compute job. this prevents users from double withdrawing.


- when lerp contract is deployed a total token supply is set.
- lerp_account can withdraw native currency from the contract and create token sale events by calling method createSale.
- sale events can be triggered whenever.
- also sale events have automatic discounts for larger amounts that is computed by a formula which decreases the price up to 50% off if user buys all of tokens of the sale in one transaction. the more the user buys the more they save. users can buy whole tokens, for each extra token the buy in once transaction, the discount price goes up automatically and is computed thorugh a hardcoded discount equation which is  ((amount/total_sale) * [saleDiscount]) %. saleDiscount is set by the admin acount during createSale method and ranges from 0 to 0.5 (0.5 being 50% off if they buy all sale tokens at once and 0 being no discount)




2 main contracts 
- LerpToken
	- controls sale of lerp founder token ($LFT) and staking. runs on etherium mainnet.

- LerpRealm
	- base class for realm contracts for withdrawing revenue earned. has public method for withdraw which also has similar lock/withdraw mechanism and merkle tree as the LerpToken but for which the offchain computeRealmMerkleTree looks at both transaction/event logs of etherium chain of main lerp contract to determine all stakers and their share amount and all publicly available revenue of the realm to determine how much each user can withdraw from the realm contract in that realms native currency based on their current stake.

#### transaction processing/merkel hash compute
- all transaction event processing occurs inside a single tick function.
- the tick function runs every 10 seconds and computes transactions.
- the tick function decides which sub process to run out of 5 available options listed below. these sub processes depend on each other in order from top to bottom.
	- computeStakesData.ts: goes through the onchain $lft contract transactions to determine who has what stakes and constructs the merkel tree. this function has to take into account previous stake withdrawals as well.
	- saveStakesData.ts: saves the computed stakes data into the db.
	- pushStakesHash.ts: pushes the last saved hash into the contract (requires gas, so needs to run in optimized way only when hash changes or stake withdrawals are available, if avail then every 24 hours, etc...).
	- computeClaimsData.ts: reads all realms onchain transactions (realms can be on different chains) that emit the revenue event - this means that a portion of the transaction money recieved by contract during a game asset sale is locked for manual claiming. the fnction builds claim data and merkel hash to be saved into the DB. this function has to take into account previous claimed amounts and airdrops.
	- saveClaimsData.ts: saves output of computeClaimsData into DB
	- pushClaimsHash.ts: reads the latest computeClaimsData from DB and pushes into each realms contract, this costs gas so must be done in an optimized way same as pushStakeHash, that means there is no reason to update the hash if its the same or throttle to be done every 24/48 hours depending on gas cost.
	- airdropClaims.ts: once certain claims reach a threshold amount, they will be automatically airdropped to the account that holds the stake on the chain of each realm.