// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

import "./Transaction.sol";

/*
*
*/

contract Utility {
    address public owner;
    string public merchant;
    
    constructor() {
        owner = msg.sender;
    }
    event Transacted (address debtor, uint256 index);
    

    /*
    * records of transactions of each merchant address
    */

    mapping (address => Transaction[]) public merchantTransaction;

    /*
    * records of utilitization of each address
    */

    mapping (address => uint256) public debt;

    /*
    * assign utility to an address
    */
    
    function add(bytes32[] memory sku, uint256[] memory price, uint256[] memory quantity, 
      bytes32[] memory description, bytes32 orderId,
      address debtor, bytes32 posId, uint256 totalAmount, uint256 timestamp) public {

        // Check again
        Transaction transaction = new Transaction(posId, orderId, debtor, debtor, totalAmount, timestamp);
        
        for (uint i = 0; i < sku.length; i++) {
            Item item = new Item(sku[i], price[i], quantity[i], description[i]);

            // item.sku = sku;
            // item.price = price;
            // item.quantity = quantity;
            // item.description = description; 
            
            transaction.add(item);
        }

        // transaction.posId = posId;
        // transaction.orderId = orderId;
        // transaction.total = totalAmount;        
        // transaction.timestamp = timestamp;

        debt[debtor]++;        

        emit Transacted(debtor, debt[debtor]);
      }

    /*
    * clear the debt owed by an address
    */

    function burn(address to, uint256 amount) public {
        require(msg.sender==owner, "sender not allowed");
        debt[to] -= amount;
    }

    /*
    * get transaction data
    */

    function getSize(address debtor) public view returns (uint256 size) {
      return debt[debtor];
    }

}
