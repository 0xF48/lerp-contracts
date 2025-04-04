/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../../common";
import type {
  MerkleProof,
  MerkleProofInterface,
} from "../../../../../@openzeppelin/contracts/utils/cryptography/MerkleProof";

const _abi = [
  {
    inputs: [],
    name: "MerkleProofInvalidMultiproof",
    type: "error",
  },
] as const;

const _bytecode =
  "0x60566050600b82828239805160001a6073146043577f4e487b7100000000000000000000000000000000000000000000000000000000600052600060045260246000fd5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600080fdfea26469706673582212200fd4791050012ae280ced9990ca1dade2fe327aa5a5be0fb8ca61e541ad5308364736f6c63430008180033";

type MerkleProofConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: MerkleProofConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class MerkleProof__factory extends ContractFactory {
  constructor(...args: MerkleProofConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(overrides || {});
  }
  override deploy(overrides?: NonPayableOverrides & { from?: string }) {
    return super.deploy(overrides || {}) as Promise<
      MerkleProof & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): MerkleProof__factory {
    return super.connect(runner) as MerkleProof__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MerkleProofInterface {
    return new Interface(_abi) as MerkleProofInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): MerkleProof {
    return new Contract(address, _abi, runner) as unknown as MerkleProof;
  }
}
