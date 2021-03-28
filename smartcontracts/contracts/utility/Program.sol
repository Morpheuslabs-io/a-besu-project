// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

import "./Merchant.sol";
import "./NameRegistryService.sol";


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
