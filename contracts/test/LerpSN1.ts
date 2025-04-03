import { expect } from "chai";



const HOST = 'https://dev.lerp.io:3003'

import { DropConfig, RealmSetConfig } from '../../lib/sets/RealmSet'
import sn1Config from "../../realms/sn1/sn1Config";
import { ethers } from "hardhat";

const CONTRACT_CONFIG = sn1Config.contract as RealmSetConfig['contract'];
const DROPS = CONTRACT_CONFIG.drops;

const REALM_UID = 1


const NUM_ATTRIBUTES = 6;
const NUM_BITS_PER_ATTRIBUTE = 8;

export function decodeTokenAttributes(encodedValue: bigint): number[] {
	const result: number[] = new Array(NUM_ATTRIBUTES + 1);

	// Decode the dropIndex from the first 3 bits and store it in the first index
	result[0] = Number((encodedValue >> BigInt(NUM_ATTRIBUTES * NUM_BITS_PER_ATTRIBUTE)) & BigInt(0xFF));
	for (let i = 0; i < NUM_ATTRIBUTES; i++) {
		// Extract each attribute value and store it in the subsequent indices
		result[i + 1] = Number((encodedValue >> BigInt(i * NUM_BITS_PER_ATTRIBUTE)) & BigInt(0xFF));
	}

	return result;
}


function testMintPack(packIndex: number) {
	it(`Should mint pack (${packIndex}) correctly`, async function () {

		const contract = await ethers.deployContract("LerpSN1");

		let tokenId: BigInt = 0n;
		let tokenUri = '';

		function checkTokenId(setTokenId: BigInt) {
			tokenId = setTokenId
			return true
		}

		function checkURI(uri: string) {
			tokenUri = (`${HOST}/t/${REALM_UID}/${tokenId}`)
			console.log('TOKEN URI', tokenUri)
			if (uri === tokenUri) return true
			return false
		}

		const setPriceNum = 0.02 + Math.random()
		const setPrice = ethers.parseEther(String(setPriceNum))
		const wrongPrice = ethers.parseEther(String(setPriceNum - 0.0001))

		let prices = [0, 0, 0]

		prices[packIndex] = Number(setPrice)
		await contract.updatePackPricing(prices)

		// let res = await contract.encodeTokenAttributes(0, [1, 2, 3, 4, 5, 6])
		// let res2 = decodeTokenAttributes(res)
		// expect(res2.toString()).to.equal('0,1,2,3,4,5,6')

		// res = await contract.encodeTokenAttributes(6, [255, 255, 255, 255, 255, 255])
		// console.log('TOKEN_ID:', res.toString())
		// res2 = decodeTokenAttributes(res)
		// expect(res2.toString()).to.equal('6,255,255,255,255,255,255')


		const packPrice = await contract.packPrice(packIndex);


		expect(packPrice).to.equal(setPrice)



		let trx = await contract.mintPack(packIndex, { value: setPrice })

		const receipt = await trx.wait()

		console.log('GAS USED:', receipt.gasUsed)

		const filter = contract.filters.TransferBatch();
		const events = await contract.queryFilter(filter, trx.blockNumber, trx.blockNumber);

		events.forEach((event) => {
			const tokenIds = event.args[3]
			for (let i = 0; i < tokenIds.length; i++) {
				const tokenId = tokenIds[i]
				// console.log('tokenId:', tokenId.toString())
				console.log('attr:', decodeTokenAttributes(tokenId).toString())
			}

		});


	})

}



describe("LerpSN1", function () {

	testMintPack(2)

	// for (let dropConfig of DROPS.slice(0, 6)) {
	// 	testMintDrop(dropConfig)
	// }

	// it("Should mint 2 drops correctly", async function () {
	// 	const [owner, otherAccount] = await hre.viem.getWalletClients();

	// 	const contract = await hre.viem.deployContract("LerpSN1");

	// 	let tokenId1: BigInt = 0n;
	// 	let tokenId2: BigInt = 0n;
	// 	let tokenUri1 = '';
	// 	let tokenUri2 = '';

	// 	function checkTokenId1(setTokenId: BigInt) {
	// 		tokenId1 = setTokenId
	// 		return true
	// 	}

	// 	function checkTokenId2(setTokenId: BigInt) {
	// 		tokenId2 = setTokenId
	// 		return true
	// 	}

	// 	function checkURI1(uri: string) {
	// 		tokenUri1 = (`https://lerp.io/t/${tokenId1}`)
	// 		if (uri === tokenUri1) return true
	// 		return false
	// 	}

	// 	function checkURI2(uri: string) {
	// 		tokenUri2 = (`https://lerp.io/t/${tokenId2}`)
	// 		if (uri === tokenUri2) return true
	// 		return false
	// 	}

	// 	await contract.write.updateMintPrice([[1, 2], [parseEther("0.03"), parseEther("0.05")]])

	// 	await expect(contract.write.mintBatch([[1, 2], [BigInt(1), BigInt(1)]], { value: parseEther("0.08") }))
	// 		.to.emit(contract, "TransferSingle")
	// 		.withArgs(anyValue, anyValue, anyValue, checkTokenId1, anyValue)
	// 		.to.emit(contract, "PermanentURI")
	// 		.withArgs(anyValue, checkURI1)
	// 		.to.emit(contract, "TransferSingle")
	// 		.withArgs(anyValue, anyValue, anyValue, checkTokenId2, anyValue)
	// 		.to.emit(contract, "PermanentURI")
	// 		.withArgs(anyValue, checkURI2)
	// })

	// Add more tests as needed
});