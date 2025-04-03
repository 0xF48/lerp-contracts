import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";



// const ONE_GWEI: bigint = parseEther("0.001");

const LerpSN1Module = buildModule("LerpSN1Module", (m) => {

	const lerpSN1 = m.contract("LerpSN1");

	return { lerpSN1 };
});

export default LerpSN1Module;
