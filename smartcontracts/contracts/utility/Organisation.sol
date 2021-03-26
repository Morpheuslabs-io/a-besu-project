// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

import "./Merchant.sol";


contract Organisation {
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
    }
    
    function addMerchant(address _merchantOwner, string memory _merchantName) public onlyAdmin returns (address merchantAddress) {
        require(_merchantOwner != address(0), "Invalid owner address");
        
        Merchant merchant = new Merchant(_merchantOwner, _merchantName);
        
        merchantsMap[_merchantOwner] = address(merchant);
        merchants.push(merchant);
        
        return address(merchant);
    }
    
    // function addMerchant(string memory _merchantName) public onlyAdmin returns (address merchantAddress) {
    //     Merchant merchant = new Merchant(msg.sender, _merchantName);
        
    //     merchantsMap[_merchantOwner] = address(merchant);
    //     merchants.push(merchant);
        
    //     return address(merchant);
    // }

    function getMerchantSize() public view returns(uint256) {
        return merchants.length;
    }

    function getMerchantByOwner(address _merchantOwner) public view returns (address merchantContractAddress) {
        return merchantsMap[_merchantOwner];
    }
}
