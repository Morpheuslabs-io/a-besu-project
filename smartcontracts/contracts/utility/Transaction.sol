progma solidity ^0.8.2;

/*
*
*/

contract Transaction {
    struct Item {
        string sku;
        string podID;
        string posName;
        string posLocation;
        uint256 price;
    }
    Item[] public items;
    uint256 public total;
    string public orderId;
    string public merchant;
    string public customer;
    string public status;
    string public posId;
    string public posLocation;
    string public posName;
    bool public settlementRequested = false;
    bool public settlementApproved = false;
    uint256 public timestamp;
    string public paymentReference;

    constructor(
        string memory _posId,
        string memory _posLocation,
        string memory _posName,
        string memory _orderId,
        string memory _merchant,
        string memory _customer,
        uint64 _timestamp) {
            posId = _posId;
            posLocation = _posLocation;
            posName = _posName;
            orderId = _orderId;
            merchant = _merchant;
            customer = _customer;
            timestamp = _timestamp;

        }
        function add(string memory _sku, uint256 _price, string memory _posID, string memory _posName, string memory _posLocation, string memory _description)
        public {
            Item memory item;
            item.sku = _sku;
            item.price = _price;
            item.posId = _posId;
            item.posName = _posName;
            item.posLocation = _posLocation;
            item.description = _description;
            total += price;
            items.push(item);
        }

        function size() public view returns (uint256) {
            return items.length;

        }

        function requestSettlement() {
            required(settlmentRequested==false, "Settlement is already requested");
            settlementRequested = true;
            status = "settlement approved";

        }

        function approveSettlement() public {
            require(settlementApproved==false, "Settlement is already approved");
            settlementApproved = true;
            status = "settlement approved";
        }

        function approveSettlement(string memory _paymentReference) public {
            paymentReferenec = +_paymentReference;
            approveSettlement();
        }
    )

}
