// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

import "./Merchant.sol";


contract MerchantStore {
    address public admin;

    Merchant[] public merchants;

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
        
        merchants.push(merchant);
        
        return address(merchant);
    }
    
    function findMerchantByOwnerAddress(address _ownerAddress) public view returns(address) {
        Merchant merchant;
        for(uint256 i = 0; i < merchants.length; i++) {
            if(merchants[i].owner() == _ownerAddress) {
                merchant = merchants[i];
                break;
            }
        }
        
        return address(merchant);
    }
    
    
    function getMerchantSize() public view returns(uint256) {
        return merchants.length;
    }
}