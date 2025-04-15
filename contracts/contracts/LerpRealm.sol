// SPDX-License-Identifier: OPEN SOURCE
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "hardhat/console.sol";

/**
 * @title LerpRealm
 * @dev Abstract base contract for Lerp game realms.
 * Handles Merkle proof based reward withdrawals for $LFT stakers and provides ERC1155 functionality for in-game assets.
 * Inheriting contracts must implement their specific game logic and emit RevenueGenerated events.
 */
abstract contract LerpRealm is ERC1155, AccessControl {
    bytes32 public claimsMerkleRoot;
    mapping(address => bool) public hasClaimed; // Tracks claims against the current root

    // --- Events ---

    event ClaimsMerkleRootUpdated(bytes32 indexed newRoot);
    event ClaimFlagsReset(address[] users);
    event RewardsWithdrawn(address indexed user, uint256 amount);
    /**
     * @dev Must be emitted by inheriting contracts when a transaction generates distributable revenue.
     * @param payer The address initiating the transaction (e.g., the asset buyer).
     * @param revenueAmount The portion of the transaction value considered distributable revenue.
     * @param totalValue The total native currency value received by the contract in the transaction.
     */
    event RevenueGenerated(
        address indexed payer,
        uint256 revenueAmount,
        uint256 totalValue
    );

    // --- Constructor ---

    /**
     * @dev Sets the ERC1155 metadata URI and grants admin role to deployer.
     * @param uri_ ERC1155 metadata URI (can be updated later via setURI).
     */
    constructor(string memory uri_) ERC1155(uri_) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // --- Admin Functions ---

    /**
     * @dev Updates the Merkle root used for verifying reward claims.
     * Should be called after claim flags are reset for the previous period.
     * @param newRoot The new Merkle root hash.
     */
    function updateClaimsMerkleRoot(
        bytes32 newRoot
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        claimsMerkleRoot = newRoot;
        emit ClaimsMerkleRootUpdated(newRoot);
    }

    /**
     * @dev Resets the claim flags for specified users, allowing them to claim against the next Merkle root.
     * Should be called *before* updating the Merkle root.
     * @param users Array of user addresses whose flags to reset.
     */
    function resetClaimFlags(
        address[] calldata users
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        for (uint i = 0; i < users.length; i++) {
            hasClaimed[users[i]] = false;
        }
        emit ClaimFlagsReset(users);
    }

    // --- Withdrawal Logic ---

    /**
     * @dev Allows a user to withdraw their calculated rewards based on a Merkle proof.
     * @param amount The amount of native currency the user is claiming.
     * @param merkleProof The Merkle proof verifying the user's address and claim amount against the current root.
     */
    function withdrawRewards(
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external {
        require(
            amount > 0,
            "LerpRealm: Claim amount must be greater than zero"
        );
        require(
            !hasClaimed[msg.sender],
            "LerpRealm: Rewards already claimed for this period"
        );

        // Construct the leaf hash expected by the off-chain computation
        // Assumes leaf = keccak256(abi.encodePacked(address, amount))
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));

        // Verify the Merkle proof
        require(
            MerkleProof.verify(merkleProof, claimsMerkleRoot, leaf),
            "LerpRealm: Invalid Merkle proof"
        );

        // Mark as claimed for this period
        hasClaimed[msg.sender] = true;

        // Transfer the native currency reward
        // Ensure the contract has sufficient balance (from RevenueGenerated events)
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "LerpRealm: Failed to send reward");

        emit RewardsWithdrawn(msg.sender, amount);
    }

    // --- ERC1155 Overrides ---

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC1155, AccessControl) returns (bool) {
        return
            interfaceId == type(IERC1155).interfaceId ||
            interfaceId == type(IAccessControl).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    // --- Internal Helper (Example for inheriting contracts) ---

    /**
     * @dev Internal function example for processing payments and emitting revenue event.
     * Inheriting contracts should call this or similar logic in their payable functions.
     * @param _revenueAmount Amount designated as distributable revenue.
     * @param _totalValue Total msg.value received.
     */
    function _processPayment(
        uint256 _revenueAmount,
        uint256 _totalValue
    ) internal virtual {
        // Emit event for off-chain processing
        emit RevenueGenerated(msg.sender, _revenueAmount, _totalValue);

        // Optional: Add logic here if the contract needs to do something immediately
        // with the non-revenue portion of the payment.
    }

    // --- Receive Ether ---
    // Allow contract to receive Ether directly (e.g., if revenue is sent separately)
    receive() external payable {}

    // Optional: Fallback function if needed, though receive() is generally preferred for simple Ether receipt.
    // fallback() external payable {}
}
