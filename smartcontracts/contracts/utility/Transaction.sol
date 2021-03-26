// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

/*
*
*/

contract Transaction {

    struct Item {
        bytes32 sku;
        uint256 price;
        uint256 quantity;
        bytes32 description;
    }

    Item[] internal items;
    uint256 internal total;
    bytes32 internal orderId;
    address internal merchant;
    address internal customer;
    bytes32 internal status;
    bytes32 internal posId;
    uint256 internal timestamp;

    bool public settlementRequested = false;
    bool public settlementApproved = false;
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

        Item memory item;
        item.sku = _sku;
        item.price = _price;
        item.quantity = _quantity;
        item.description = _description;

        items.push(item);
        return items.length;
    }

    function numberOfItems() public view returns (uint256) {
        return items.length;
    }

    function getTransactionInfo() public view returns (
        bytes32 _posId, bytes32 _orderId, address _merchant, 
        address _customer, uint256 _total, uint256 _timestamp
    ) {
        return (posId, orderId, merchant, customer, total, timestamp);
    }

    function getItems() public view returns (bytes32[] memory skus, uint256[] memory prices, uint256[] memory qtys, bytes32[] memory descs) {
        uint length = items.length;
        bytes32[] memory _skus = new bytes32[](length);
        uint256[] memory _prices = new uint256[](length);
        uint256[] memory _qtys = new uint256[](length);
        bytes32[] memory _descs = new bytes32[](length);

        for(uint i = 0; i < length; i++) {
            _skus[i] = items[i].sku;
            _prices[i] = items[i].price;
            _qtys[i] = items[i].quantity;
            _descs[i] = items[i].description;
        }

        return (_skus, _prices, _qtys, _descs);
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
