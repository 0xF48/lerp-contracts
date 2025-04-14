//SPDX-License-Identifier: OPEN SOURCE
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "hardhat/console.sol";

contract LerpToken is ERC20, AccessControl {
    uint256 public constant TOTAL_SUPPLY = 42000 * 10 ** 18;
    uint256 public constant LOCK_AMOUNT = 28 * 3 days; // ~12 weeks

    bytes32 public stakeWithdrawalMerkleRoot;
    // Mapping to prevent double withdrawal within a Merkle root period
    mapping(address => mapping(uint16 => bool)) public hasWithdrawnStake;

    event TokensStaked(
        address indexed user,
        uint16 indexed realmId,
        uint256 amount,
        uint256 unlockTime // Timestamp when the stake becomes eligible for withdrawal
    );

    // Event to signal withdrawal flag reset (optional but good practice)
    event WithdrawalFlagsReset(uint16[] realmIds, address[] users);

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _mint(address(this), TOTAL_SUPPLY); // Mint supply to the contract
    }

    // --- Sale Logic ---
    uint256 public saleTokenPrice = 0;
    uint256 public saleAvailableTokens = 0;
    uint256 public distributedTokens = 0;
    uint256 public saleEndTime;

    function startSale(
        uint256 setSaleAvailableTokens,
        uint256 setSaleTokenPrice, // Price per whole LFT token in wei
        uint256 durationInSeconds
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            setSaleAvailableTokens <= balanceOf(address(this)),
            "Not enough tokens in contract"
        );
        saleTokenPrice = setSaleTokenPrice;
        saleAvailableTokens = setSaleAvailableTokens;
        saleEndTime = block.timestamp + durationInSeconds;
    }

    function buyTokens(uint256 amount) external payable {
        require(amount > 0, "Amount must be > 0");
        require(block.timestamp <= saleEndTime, "Sale has ended");
        require(amount <= saleAvailableTokens, "Not enough tokens available");

        // Calculate total price based on amount and saleTokenPrice (which is per whole token)
        uint256 totalPrice = (amount * saleTokenPrice) / (10 ** decimals()); // Use decimals()
        require(msg.value >= totalPrice, "Insufficient funds sent");

        saleAvailableTokens -= amount;
        distributedTokens += amount;
        _transfer(address(this), msg.sender, amount);

        uint256 refund = msg.value - totalPrice;
        if (refund > 0) {
            payable(msg.sender).transfer(refund);
        }
    }

    // --- Native Currency Withdrawal (Admin) ---
    function withdrawAllNativeCurrency() external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        payable(msg.sender).transfer(balance);
    }

    function withdrawNativeCurrency(
        uint256 amount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(address(this).balance >= amount, "Insufficient balance");
        payable(msg.sender).transfer(amount);
    }

    // --- Token Distribution (Admin) ---
    function adminDistribute(
        address to,
        uint256 amount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(to != address(0), "ERC20: transfer to the zero address");
        uint256 contractBalance = balanceOf(address(this));
        require(
            contractBalance >= amount,
            "ERC20: transfer amount exceeds contract balance"
        );
        _transfer(address(this), to, amount);
    }

    // --- Staking Logic ---
    function stakeTokensToRealm(uint16 realmId, uint256 amount) external {
        require(amount > 0, "Cannot stake 0");
        _transfer(msg.sender, address(this), amount); // Transfer tokens to contract

        uint256 unlockTime = block.timestamp + LOCK_AMOUNT;
        emit TokensStaked(msg.sender, realmId, amount, unlockTime);
    }

    // --- Stake Withdrawal Logic ---
    function updateStakeWithdrawalMerkleRoot(
        bytes32 newRoot
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        // Consider adding an event here
        stakeWithdrawalMerkleRoot = newRoot;
        // Note: Resetting flags should happen *before* updating the root usually
    }

    /**
     * @notice Allows resetting withdrawal flags for users, typically done before updating the Merkle root.
     * @param users Array of user addresses whose flags to reset.
     * @param realmIds Array of realm IDs corresponding to each user. Must be same length as users.
     */
    function resetWithdrawalFlags(
        address[] calldata users,
        uint16[] calldata realmIds
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            users.length == realmIds.length,
            "Input array lengths mismatch"
        );
        for (uint i = 0; i < users.length; i++) {
            hasWithdrawnStake[users[i]][realmIds[i]] = false;
        }
        emit WithdrawalFlagsReset(realmIds, users);
    }

    /**
     * @notice Withdraws the user's entire staked principal for a specific realm if the lock period has passed and proof is valid.
     * @param realmId The ID of the realm to withdraw stake from.
     * @param totalStakedAmount The total amount the user has staked in this realm (verified by proof).
     * @param latestUnlockTime The latest unlock timestamp for the user's stake in this realm (verified by proof).
     * @param merkleProof The Merkle proof verifying the user's eligibility.
     */
    function withdrawStakedTokens(
        uint16 realmId,
        uint256 totalStakedAmount, // Amount verified by the proof
        uint256 latestUnlockTime, // Unlock time verified by the proof
        bytes32[] calldata merkleProof
    ) external {
        require(totalStakedAmount > 0, "No stake to withdraw based on proof");
        require(
            !hasWithdrawnStake[msg.sender][realmId],
            "Stake already withdrawn this period"
        );
        require(
            block.timestamp >= latestUnlockTime,
            "Stake lock period not yet ended"
        );

        // Construct the leaf hash including realmId to match the single global tree
        bytes32 leaf = keccak256(
            abi.encodePacked(
                msg.sender,
                realmId,
                totalStakedAmount,
                latestUnlockTime
            ) // Added realmId
        );

        // Verify the Merkle proof against the single global root
        require(
            MerkleProof.verify(merkleProof, stakeWithdrawalMerkleRoot, leaf),
            "Invalid merkle proof"
        );

        // Mark as withdrawn for this period
        hasWithdrawnStake[msg.sender][realmId] = true;

        // Transfer the *entire* verified staked amount back to the user
        _transfer(address(this), msg.sender, totalStakedAmount);
    }
}
