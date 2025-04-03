//SPDX-License-Identifier: OPEN SOURCE
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "hardhat/console.sol";

contract LerpSN1 is ERC1155, AccessControl {
    using Strings for uint256;

    // Prices for each NFT type

    uint256 public totalMinted;
    uint256 public prizePool;
    uint8 public constant REALM_UID = 1;
    uint8 private constant MIN_DROP_UID = 0;
    uint8 private constant MAX_DROP_UID = 6;
    uint8 private constant NUM_ATTRIBUTES = 6;
    uint8 private constant NUM_BITS_PER_ATTRIBUTE = 8;

    uint256[3] public packPrice;
    uint8[12] public attributeBounds;
    uint8[3][12] public packAttributeBounds;

    bool public mintLock = false;

    // Random attributes for each NFT type
    constructor() ERC1155("") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        packPrice[0] = 1e18;
        packPrice[1] = 2e18;
        packPrice[2] = 3e18;

        attributeBounds[0] = 1; // min for attribute 1
        attributeBounds[1] = 30; // max for attribute 1

        attributeBounds[2] = 1; // min for attribute 2
        attributeBounds[3] = 30; // max for attribute 2

        attributeBounds[4] = 1; // min for attribute 3
        attributeBounds[5] = 30; // max for attribute 3

        attributeBounds[6] = 0; // min for attribute 4
        attributeBounds[7] = 7; // max for attribute 4

        attributeBounds[8] = 0; // min for attribute 5
        attributeBounds[9] = 14; // max for attribute 5

        attributeBounds[10] = 0; // min for attribute 6
        attributeBounds[11] = 14; // max for attribute 6

        packAttributeBounds[0] = [1, 7, 14];
        packAttributeBounds[1] = [20, 30, 30];

        packAttributeBounds[2] = [1, 7, 14];
        packAttributeBounds[3] = [20, 30, 30];

        packAttributeBounds[4] = [1, 7, 14];
        packAttributeBounds[5] = [20, 30, 30];

        packAttributeBounds[6] = [0, 1, 1];
        packAttributeBounds[7] = [7, 7, 7];

        packAttributeBounds[8] = [0, 1, 1];
        packAttributeBounds[9] = [14, 14, 14];

        packAttributeBounds[10] = [0, 1, 1];
        packAttributeBounds[11] = [14, 14, 14];
    }

    function updatePackPricing(uint256[] memory newPrice) public {
        //check if the sender is the owner of the contract
        _checkRole(DEFAULT_ADMIN_ROLE, msg.sender);

        require(newPrice.length == 3, "price.length !==3");

        for (uint8 i = 0; i < 3; i++) {
            packPrice[i] = newPrice[i];
        }
    }

    function withdraw() public {
        _checkRole(DEFAULT_ADMIN_ROLE, msg.sender);
        //check if the sender is the owner of the contract
        payable(msg.sender).transfer(address(this).balance);
    }

    function mintPack(uint8 packIndex) public payable {
        require(!mintLock, "Minting is locked");
        require(packIndex >= 0 && packIndex <= 2, "Invalid chest index");
        require(msg.value == packPrice[packIndex], "Invalid price");

        bytes memory packed = abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender
        );

        uint256[] memory tokenIds = new uint256[](6);
        uint256[] memory amounts = new uint256[](6);

        uint16 prevIndex = 0;

        for (uint16 i = 0; i < 6; i++) {
            packed = abi.encodePacked(packed, i * 13, prevIndex * 17);

            uint16 dropIndex = uint16(uint256(keccak256(packed)) % 7);
            prevIndex = dropIndex;
            tokenIds[i] = generateTokenId(uint8(dropIndex), packIndex, packed);
            amounts[i] = 1;
            // emit PermanentURI(uri(tokenIds[i]), tokenIds[i]);
        }

        // Batch minting in a single call
        _mintBatch(msg.sender, tokenIds, amounts, "");

        totalMinted += 6;
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

    function uri(uint256 tokenId) public pure override returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "https://lerp.io/t/",
                    Strings.toString(REALM_UID),
                    "/",
                    Strings.toString(tokenId)
                )
            );
    }

    function generateTokenId(
        uint8 dropIndex,
        uint8 chestIndex,
        bytes memory packed
    ) public view returns (uint256) {
        // require(dropIndex >= 0 && dropIndex <= 6, "Invalid drop Index");

        uint8[] memory values = new uint8[](6);

        for (uint16 i = 0; i < 6; i++) {
            uint256 min = uint256(packAttributeBounds[i * 2][chestIndex]);
            uint256 max = uint256(packAttributeBounds[i * 2 + 1][chestIndex]);

            bytes32 hashValue = keccak256(
                abi.encodePacked(
                    packed,
                    dropIndex * 42,
                    min * 31,
                    max * 13,
                    i * 17
                )
            );

            uint256 randomValue = (uint256(hashValue));

            uint256 range = max - min + 1;
            randomValue = (randomValue % range) + min;

            values[i] = uint8(randomValue);
        }

        return encodeTokenAttributes(dropIndex, values);
    }

    function encodeTokenAttributes(
        uint8 dropIndex,
        uint8[] memory values
    ) public pure returns (uint256) {
        require(values.length == 6, "Values length mismatch");

        uint256 encodedValue = 0;

        // Encode the dropIndex in the first 3 bits (since 2^3 = 8, which covers the range 0-7)
        encodedValue |=
            uint256(dropIndex) <<
            (NUM_ATTRIBUTES * NUM_BITS_PER_ATTRIBUTE);

        for (uint256 i = 0; i < values.length; i++) {
            uint8 value = values[i];

            // Shift the value to its correct position and combine it with the result
            encodedValue |= uint256(value) << (i * NUM_BITS_PER_ATTRIBUTE);
        }

        return encodedValue;
    }

    function decodeTokenAttributes(
        uint256 encodedValue
    ) public pure returns (uint8[] memory) {
        uint8[] memory result = new uint8[](NUM_ATTRIBUTES + 1);

        // Decode the dropIndex from the first 3 bits and store it in the first index
        result[0] = uint8(
            (encodedValue >> (NUM_ATTRIBUTES * NUM_BITS_PER_ATTRIBUTE)) & 0xFF
        );

        for (uint256 i = 0; i < NUM_ATTRIBUTES; i++) {
            // Extract each attribute value and store it in the subsequent indices
            result[i + 1] = uint8(
                (encodedValue >> (i * NUM_BITS_PER_ATTRIBUTE)) & 0xFF
            );
        }

        return result;
    }

    // ------------- MARKET 0.1 -------------
    // struct Trade {
    //     address seller;
    //     uint256 tokenId;
    //     uint256 amount;
    //     uint256 price;
    // }

    // Trade[] public trades;

    // function listTokenForSale(
    //     uint256 tokenId,
    //     uint256 amount,
    //     uint256 price
    // ) public {
    //     require(
    //         balanceOf(msg.sender, tokenId) >= amount,
    //         "Insufficient token balance"
    //     );
    //     trades.push(
    //         Trade({
    //             seller: msg.sender,
    //             tokenId: tokenId,
    //             amount: amount,
    //             price: price
    //         })
    //     );
    // }

    // function buyToken(uint256 tradeIndex) public payable {
    //     Trade memory trade = trades[tradeIndex];
    //     require(msg.value == trade.price, "Incorrect price");

    //     safeTransferFrom(
    //         trade.seller,
    //         msg.sender,
    //         trade.tokenId,
    //         trade.amount,
    //         ""
    //     );

    //     payable(trade.seller).transfer(msg.value);

    //     // Remove the trade from the list
    //     trades[tradeIndex] = trades[trades.length - 1];
    //     trades.pop();
    // }
}
