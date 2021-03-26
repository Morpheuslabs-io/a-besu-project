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
        bytes32 _posId,
        bytes32 _orderId,
        address _merchant,
        address _customer,
        uint256 _total,
        uint256 _timestamp) {
            posId = _posId;
            orderId = _orderId;
            merchant = _merchant;
            customer = _customer;
            total = _total;
            timestamp = _timestamp;
    }
        
    function add(bytes32 _sku, uint _price, uint _quantity, bytes32 _description) public returns (uint) {
        Item item = new Item(_sku, _price, _quantity, _description);
        items.push(item);
        return items.length;
    }

    function numberOfItems() public view returns (uint256) {
        return items.length;

    }

    function requestSettlement() internal{
        require(!settlementRequested, "Settlement is already requested");
        settlementRequested = true;
        status = "settlement requested";

    }

    function approveSettlement() public {
        require(settlementApproved==false, "Settlement is already approved");
        settlementApproved = true;
        status = "settlement approved";
    }

    function approveSettlement(bytes32 _paymentReference) internal {
        paymentReference = _paymentReference;
        approveSettlement();
    }
}
