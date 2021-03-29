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

contract Merchant {
    address public owner;
    string public merchantName;
    // add more field for merchant information
    
    Transaction[] public merchantTransactions;
    mapping (address => Transaction[]) internal userTransactions;
    mapping (address => uint256) public userTotal; // total tokens spent by each user
    mapping (address => uint256) public supplyTotal; // total tokens merchant owed for each supplier

    event Transact(address user, uint256 index);
    constructor(address _owner, string memory _merchantName) {
        owner = _owner;
        merchantName = _merchantName;
    }
    
    function purchase(bytes32[] memory _skus, uint256[] memory _prices, uint256[] memory _quantites, bytes32[] memory _descriptions, bytes32 _orderId,
                        address _user, bytes32 _posId, uint256 _totalAmount, uint256 _timestamp) public {
        require(
            (_skus.length == _prices.length) && 
            (_prices.length == _quantites.length) && 
            (_quantites.length == _descriptions.length), "Length of input array is not the same");
            
        require(_user != address(0), "Invalid customer");

        Transaction transaction = new Transaction(
            _posId,
            _orderId,
            address(this),
            _user,
            _totalAmount,
            _timestamp
        );

        for (uint i = 0; i < _skus.length; i++) {
            transaction.add(_skus[i],_prices[i], _quantites[i], _descriptions[i]);
        }
        
        merchantTransactions.push(transaction);
        userTransactions[_user].push(transaction);
        
        emit Transact(_user, merchantTransactions.length + 1);
    }

    /*
    * clear the userTotal owed by an address
    */

    function burn(address _to, uint256 _amount) public {
        require(msg.sender == owner, "sender not allowed");
        userTotal[_to] -= _amount;
    }

    function getUserTransactions(address _userAddress) public view returns(Transaction[] memory txs) {
        return userTransactions[_userAddress];
    }

    // /*
    // * get transaction data
    // */

    // function getSize(address user) public view returns (uint256) {
    //   return utility[user].length;
    // }

}

contract NameRegistryService {
    address public admin;
    modifier onlyAdmin {
        require(msg.sender == admin, "Caller is not admin");
        _;
    }

    mapping(string => address) internal nameMapping;

    constructor() {
        admin = msg.sender;
    }

    function register(string memory _name, address _contractAddress) public onlyAdmin {
        require(_contractAddress != address(0), 'Invalid contract address');
        require(nameMapping[_name] == address(0), 'Naming is already in use');

        nameMapping[_name] = _contractAddress;
    }

    function modifyAddress(string memory _name, address _contractAddress) public onlyAdmin {
        require(_contractAddress != address(0), 'Invalid contract address');
        nameMapping[_name] = _contractAddress;
    }

    function getContractAddress(string memory _name) public view returns(address) {
        return nameMapping[_name];
    }
}

contract Program {
    NameRegistryService public namingService;
    address public admin;

    Merchant[] public merchants;
    // mapping address owner to merchant address contract
    mapping(address => address) merchantsMap;

    modifier onlyAdmin {
        require(msg.sender == admin, "Caller is not admin");
        _;
    }
    
    constructor() {
        admin = msg.sender;
        namingService = new NameRegistryService();
    }
    
    function addMerchant(address _merchantOwner, string memory _merchantName) public onlyAdmin returns (address merchantAddress) {
        require(_merchantOwner != address(0), "Invalid owner address");

        Merchant merchant = new Merchant(_merchantOwner, _merchantName);
        
        merchantsMap[_merchantOwner] = address(merchant);
        merchants.push(merchant);

        namingService.register(_merchantName, address(merchant));
        
        return address(merchant);
    }

    function getNumOfMerchants() public view returns(uint256) {
        return merchants.length;
    }

    function getMerchantByOwner(address _merchantOwner) public view returns (address merchantContractAddress) {
        return merchantsMap[_merchantOwner];
    }

    function getMerchantByName(string memory _name) public view returns (address merchantContractAddress) {
        return namingService.getContractAddress(_name);
    }
}
