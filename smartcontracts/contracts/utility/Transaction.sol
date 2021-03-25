// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

import "./Item.sol";
/*
*
*/

contract Transaction {

    Item[] public items;
    uint256 public total;
    bytes32 public orderId;
    address public merchant;
    address public customer;
    bytes32 public status;
    bytes32 public posId;
    bool public settlementRequested = false;
    bool public settlementApproved = false;
    uint256 public timestamp;
    bytes32 public paymentReference;

    constructor(
        bytes32 memory _posId,
        bytes32 memory _orderId,
        address memory _merchant,
        address memory _customer,
        uint256 memory _total,
        uint64 _timestamp) {
            posId = _posId;
            orderId = _orderId;
            merchant = _merchant;
            customer = _customer;
            total = _total;
            timestamp = _timestamp;

        }
        function add(Item _item) public returns (uint) {
            Item item = new Item(_item._sku, _item._price, _item._quantity, _item._description);
            items.push(item);
            return items.length;
        }

        function numberOfItems() public view returns (uint256) {
            return items.length;

        }

        function requestSettlement() public {
            require(settlementRequested==false, "Settlement is already requested");
            settlementRequested = true;
            status = "settlement requested";

        }

        function approveSettlement() public {
            require(settlementApproved==false, "Settlement is already approved");
            settlementApproved = true;
            status = "settlement approved";
        }

        function approveSettlement(string memory _paymentReference) public {
            paymentReference = _paymentReference;
            approveSettlement();
        }
    

}
