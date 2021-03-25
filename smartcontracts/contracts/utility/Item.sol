// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

/*
*
*/

contract Item {

    bytes32 public sku;
    uint256 public price;
    uint256 public quantity;
    bytes32 public description;

    constructor(
        bytes32 _sku,
        uint256 _price,
        uint256 _quantity,
        bytes32 _description) {
        sku = _sku;
        price = _price;
        quantity = _quantity;
        description = _description;
      }

}
