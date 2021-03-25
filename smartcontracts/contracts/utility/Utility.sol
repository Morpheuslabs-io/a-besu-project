// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

import "./Transaction.sol";

/*
*
*/

contract Utility {
    address public owner;
    string public merchant;
    
    constructor() public {
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
    
    function add(bytes32[] sku, uint256[] price, uint256[] quantity, bytes32[] description, bytes32 orderId,
                        address debtor, bytes32 memory posId, uint256 totalAmount, uint256 memory timestamp) public {
        Transaction transaction = new Transaction();


        
        
        for (uint i = 0; i < sku.length; i++) {
            Item item = new Item();

            item.sku = sku;
            item.price = price;
            item.quantity = quantity;
            item.description = description; 
            transaction.add(item);
        }

        transaction.posId = posId;
        transaction.orderId = orderId;
        transaction.total = totalAmount;        
        transaction.timestamp = timestamp;

        emit Transacted(debtor, utility[debtor].length+1);
      }

    /*
    * clear the debt owed by an address
    */

    function burn(address to, uint256 amount) public {
        require(msg.sender==owner, "sender not allowed");
        debt(to)-=amount;
    }

    /*
    * get transaction data
    */

    function getSize(address debtor) public view returns (uint256 size) {
      return utility[debtor].length;
    }

}
