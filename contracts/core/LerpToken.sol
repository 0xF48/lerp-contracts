//SPDX-License-Identifier: OPEN SOURCE
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol"; // Added import
import "hardhat/console.sol";

contract LerpToken is ERC20, AccessControl {
    uint256 public constant TOTAL_SUPPLY = 42000 * 10 ** 18;
    uint256 public constant LOCK_AMOUNT = 28 * 3 days;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        // Mint 42,000 tokens to the contract itself
        _mint(address(this), TOTAL_SUPPLY);
    }

    uint256 public saleTokenPrice;
    uint256 public saleAvailableTokens;
    uint256 public saleEndTime;

    bytes32 public stakeWithdrawalMerkleRoot;

    event TokensStaked(
        address indexed user,
        uint16 indexed realmId,
        uint256 amount,
        uint256 unlockTime
    );

    function startSale(
        uint256 setSaleAvailableTokens,
        uint256 setSaleTokenPrice,
        uint256 durationInSeconds
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            setSaleAvailableTokens <= balanceOf(address(this)), // Corrected variable name
            "Not enough tokens in contract"
        );

        saleTokenPrice = setSaleTokenPrice;
        saleAvailableTokens = setSaleAvailableTokens;
        saleEndTime = block.timestamp + durationInSeconds;
    }

    function buyTokens(uint256 amount) external payable {
        require(amount > 0, "Amount must be greater than 0");
        require(block.timestamp <= saleEndTime, "Sale has ended");
        require(amount <= saleAvailableTokens, "Not enough tokens available");

        // Correct totalPrice calculation considering token decimals (18)
        uint256 totalPrice = (amount * saleTokenPrice) / (10 ** 18);
        require(msg.value >= totalPrice, "Insufficient funds sent");

        saleAvailableTokens -= amount;
        _transfer(address(this), msg.sender, amount);

        uint256 refund = msg.value - totalPrice;
        if (refund > 0) {
            payable(msg.sender).transfer(refund);
        }
    }

    function withdrawAllNativeCurrency() external onlyRole(DEFAULT_ADMIN_ROLE) {
        // Added 'function' keyword
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

    // Users stake tokens by transferring them to the contract.
    // The event emitted includes the realmId and unlockTime for offchain tracking.
    function stakeTokensToRealm(uint16 realmId, uint256 amount) external {
        require(amount > 0, "Cannot stake 0");
        // Transfer tokens to the contract as escrow.
        _transfer(msg.sender, address(this), amount);

        uint256 unlockTime = block.timestamp + LOCK_AMOUNT;

        emit TokensStaked(msg.sender, realmId, amount, unlockTime);
    }

    function updateStakeWithdrawalMerkleRoot(
        bytes32 newRoot
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        stakeWithdrawalMerkleRoot = newRoot;
    }

    function withdrawStakedTokens(
        uint16 realmId,
        uint256 withdrawAmount,
        bytes32[] calldata merkleProof
    ) external {
        require(withdrawAmount > 0, "Withdraw amount must be > 0");

        bytes32 leaf = keccak256(
            abi.encodePacked(msg.sender, realmId, withdrawAmount)
        );
        require(
            MerkleProof.verify(merkleProof, stakeWithdrawalMerkleRoot, leaf),
            "Invalid merkle proof"
        );

        // Transfers tokens from the contract back to the user.
        _transfer(address(this), msg.sender, withdrawAmount);
    }
}
