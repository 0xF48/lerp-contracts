// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.24;

import "./LerpRealm.sol";
import "hardhat/console.sol";

/**
 * @title PodRunRealm
 * @dev Example game realm contract inheriting from LerpRealm.
 * Implements a simple payable mint function for a specific ERC1155 token
 * and signals revenue generation for dividend distribution.
 */
contract PodRunRealm is LerpRealm {
    // --- Constants ---

    // Example: ID for a specific in-game item/pod
    uint256 public constant POD_TOKEN_ID = 1;
    // Example: Price in native currency (e.g., 0.01 ETH in wei)
    uint256 public constant POD_TOKEN_PRICE = 0.01 ether;
    // Example: Percentage of revenue shared with stakers (e.g., 80%)
    uint8 public constant REVENUE_SHARE_PERCENT = 80;

    // --- Constructor ---

    /**
     * @dev Sets the ERC1155 metadata URI for PodRun assets.
     */
    /**
     * @dev Sets the ERC1155 metadata URI by passing it to the LerpRealm constructor.
     * @param uri_ ERC1155 metadata URI for PodRun assets.
     */
    constructor(string memory uri_) LerpRealm(uri_) {
        // Optional: Grant specific roles if needed for this realm
    }

    // --- Public Functions ---

    /**
     * @dev Allows a player to pay native currency to mint a specific Pod token (ID 1).
     * Emits a RevenueGenerated event for off-chain processing.
     */
    function mintPod() public payable {
        require(
            msg.value == POD_TOKEN_PRICE,
            "PodRunRealm: Incorrect payment amount"
        );

        // Mint the ERC1155 token to the player
        _mint(msg.sender, POD_TOKEN_ID, 1, ""); // Mint 1 token of POD_TOKEN_ID

        // Calculate the portion of the payment considered distributable revenue
        uint256 revenueAmount = (msg.value * REVENUE_SHARE_PERCENT) / 100;

        // Process the payment and signal the revenue
        _processPayment(revenueAmount, msg.value);

        // Optional: Emit a specific event for this realm's mint action
        // emit PodMinted(msg.sender, POD_TOKEN_ID);
    }

    // --- ERC1155 URI Handling (Optional Override) ---
    // Override uri function if you need dynamic URIs based on token ID
    // function uri(uint256 _tokenId) public view virtual override returns (string memory) {
    //     require(_tokenId == POD_TOKEN_ID, "PodRunRealm: URI query for nonexistent token");
    //     return super.uri(_tokenId); // Or return custom URI logic
    // }

    // --- Other Game Logic ---
    // Add other functions specific to the PodRun game mechanics here.
}
