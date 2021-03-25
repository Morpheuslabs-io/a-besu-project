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
    mapping (address => Transaction[]) public userTransactions;
    mapping (address => uint256) public debt;

    event Transact(address debtor, uint256 index);
    constructor(address _owner, string memory _merchantName) {
        owner = _owner;
        merchantName = _merchantName;
    }
    
    function add(bytes32[] memory _skus, uint256[] memory _prices, uint256[] memory _quantites, bytes32[] memory _descriptions, bytes32 _orderId,
                        address _debtor, bytes32 _posId, uint256 _totalAmount, uint256 _timestamp) public {
                            
        require(
            (_skus.length == _prices.length) && 
            (_prices.length == _quantites.length) && 
            (_quantites.length == _descriptions.length), "Length of input array is not the same");
            
        require(_debtor != address(0), "Invalid customer");
                            
        Transaction transaction = new Transaction(
            _posId,
            _orderId,
            address(this),
            _debtor,
            _totalAmount,
            _timestamp
        );

        for (uint i = 0; i < _skus.length; i++) {
            transaction.add(_skus[i],_prices[i], _quantites[i], _descriptions[i]);
        }
        
        merchantTransactions.push(transaction);
        userTransactions[_debtor].push(transaction);
        
        emit Transact(_debtor, merchantTransactions.length + 1);
    }

    /*
    * clear the debt owed by an address
    */

    function burn(address _to, uint256 _amount) public {
        require(msg.sender == owner, "sender not allowed");
        debt[_to] -= _amount;
    }

    // /*
    // * get transaction data
    // */

    // function getSize(address debtor) public view returns (uint256) {
    //   return utility[debtor].length;
    // }

}
