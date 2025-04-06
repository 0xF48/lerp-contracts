//SPDX-License-Identifier: OPEN SOURCE
pragma solidity ^0.8.0;

// Removed ERC20 import as LerpRealm is not a token itself
import "@openzeppelin/contracts/access/AccessControl.sol";
import "hardhat/console.sol";

// Made abstract as it's a base contract, removed ERC20 inheritance
abstract contract LerpRealm is AccessControl {
    // TODO: Add base realm logic (e.g., Merkle root updates, withdrawal function)
}
