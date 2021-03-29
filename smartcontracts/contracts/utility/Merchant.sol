// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

import "./Transaction.sol";

/*
*
*/

contract Merchant {
    address public owner;
    string public merchantName;
    // add more field for merchant information
    
    Transaction[] public merchantTransactions;
    address[] internal purchasedUsers;
    mapping (address => bool) isPurchased;
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

        userTotal[_user] = userTotal[_user] + _totalAmount;
        
        if(!isPurchased[_user]) {
            isPurchased[_user] = true;
            purchasedUsers.push(_user);
        }
        
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
    
    function getPurchasedUsers() public view returns (address[] memory users) {
        return purchasedUsers;
    }

    // /*
    // * get transaction data
    // */

    // function getSize(address user) public view returns (uint256) {
    //   return utility[user].length;
    // }

}
