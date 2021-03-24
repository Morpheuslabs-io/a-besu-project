progma solidity ^0.8.2;

/*
*
*/

contract Transaction {
    struct Item {
        bytes32 sku;
        uint256 price;
        uint256 quantity;
        bytes32 desciption;
    }
    Item[] public items;
    uint256 public total;
    bytes32 public orderId;
    bytes32 public merchant;
    bytes32 public customer;
    bytes32 public status;
    bytes32 public posId;
    bool public settlementRequested = false;
    bool public settlementApproved = false;
    uint256 public timestamp;
    bytes32 public paymentReference;

    constructor(
        bytes32 memory _posId,
        bytes32 memory _orderId,
        bytes32 memory _merchant,
        bytes32 memory _customer,
        uint256 memory _total,
        uint64 _timestamp) {
            posId = _posId;
            orderId = _orderId;
            merchant = _merchant;
            customer = _customer;
            total = _total;
            timestamp = _timestamp;

        }
        function add(bytes32 memory _sku, uint256 _price, uint256 _quantity, bytes32 memory _posID, bytes32 memory _description)
        public {
            Item memory item;
            item.sku = _sku;
            item.price = _price;
            item.quantity = _quantity;
            item.description = _description;
            items.push(item);
        }

        function numberOfItems() public view returns (uint256) {
            return items.length;

        }

        function requestSettlement() {
            required(settlmentRequested==false, "Settlement is already requested");
            settlementRequested = true;
            status = "settlement requested";

        }

        function approveSettlement() public {
            require(settlementApproved==false, "Settlement is already approved");
            settlementApproved = true;
            status = "settlement approved";
        }

        function approveSettlement(string memory _paymentReference) public {
            paymentReferenec = _paymentReference;
            approveSettlement();
        }
    )

}
