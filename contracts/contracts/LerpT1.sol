//SPDX-License-Identifier: OPEN SOURCE
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "hardhat/console.sol";

contract LerpT1 is ERC1155, AccessControl {
    using Strings for uint256;

    // Prices for each NFT type
    uint256[6] public mintPrice;
    uint16 public totalMinted;
    uint8 private constant REALM_UID = 2;
    uint256 public prizePool;
    uint8 private constant MIN_DROP_UID = 1;
    uint8 private constant MAX_DROP_UID = 6;

    // Random attributes for each NFT type
    constructor() ERC1155("") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        mintPrice[0] = 1e14;
        mintPrice[1] = 2e14;
        mintPrice[2] = 3e14;
        mintPrice[3] = 4e14;
        mintPrice[4] = 5e14;
        mintPrice[5] = 6e14;
    }

    function updateMintPrice(
        uint8[] memory dropIds,
        uint256[] memory prices
    ) public {
        //check if the sender is the owner of the contract
        _checkRole(DEFAULT_ADMIN_ROLE, msg.sender);
        require(dropIds.length == prices.length, "Invalid input");
        for (uint256 i = 0; i < dropIds.length; i++) {
            mintPrice[dropIds[i]] = prices[i];
        }
    }

    function withdraw() public {
        _checkRole(DEFAULT_ADMIN_ROLE, msg.sender);
        //check if the sender is the owner of the contract
        payable(msg.sender).transfer(address(this).balance);
    }

    function fmint(uint8 dropId) public {
        _checkRole(DEFAULT_ADMIN_ROLE, msg.sender);
        require(
            dropId >= MIN_DROP_UID && dropId <= MAX_DROP_UID,
            "Invalid dropId"
        );
        totalMinted++;
        uint256 tokenId = generateTokenId(dropId, rollSeed(dropId));
        emit PermanentURI(uri(tokenId), tokenId);
        _mint(msg.sender, tokenId, 1, "");
    }

    event PermanentURI(string _value, uint256 indexed _id);

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(AccessControl, ERC1155) returns (bool) {
        return
            interfaceId == type(IAccessControl).interfaceId ||
            interfaceId == type(IERC1155).interfaceId ||
            interfaceId == type(IERC1155MetadataURI).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function mint(uint8 dropId) public payable {
        require(
            dropId >= MIN_DROP_UID && dropId <= MAX_DROP_UID,
            "Invalid dropId"
        );

        require(msg.value >= mintPrice[dropId - 1], "Insufficient funds");
        totalMinted++;

        uint256 tokenId = generateTokenId(dropId, rollSeed(dropId));
        emit PermanentURI(uri(tokenId), tokenId);
        _mint(msg.sender, tokenId, 1, "");
    }

    function rollSeed(uint8 dropId) internal view returns (uint16) {
        // Generate a pseudo-random number using a combination of variables
        uint256 random = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp, // Current block timestamp
                    block.prevrandao,
                    msg.sender, // Address of the sender
                    dropId, // Token type
                    totalMinted
                )
            )
        );

        return uint16(random % 65536); // Convert it to uint16
    }

    function uri(uint256 tokenId) public pure override returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "https://lerp.io/t/",
                    Strings.toString(tokenId)
                )
            );
    }

    function generateTokenId(
        uint8 dropId,
        uint16 attributeSeed
    ) internal pure returns (uint256) {
        return
            (uint256(REALM_UID) << 24) |
            (uint256(dropId) << 16) |
            uint256(attributeSeed);
    }

    function extractWorldId(uint256 tokenId) internal pure returns (uint8) {
        return uint8(tokenId >> 24);
    }

    function extractTypeId(uint256 tokenId) internal pure returns (uint8) {
        return uint8(tokenId >> 16);
    }

    function extractAttributeSeed(
        uint256 tokenId
    ) internal pure returns (uint16) {
        return uint16(tokenId);
    }
}
