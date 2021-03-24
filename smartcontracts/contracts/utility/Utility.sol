pragma solidity ~0.8.2;

import "./Transaction.sol";

/*
*
*/

contract Utility {
    address public owner;
    string public merchant;
    constructor(address _owner, string memory _merchant) public {
        owner = _owner;
        merchant = _merchant;
    }
    event Transacted (address debtor, unit256 index);

    /*
    * records of utilitization of each address
    */

    mapping (address => Transaction[]) public utility;

    /*
    * records of utilitization of each address
    */

    mapping (address => uint256) public debt;

    /*
    * assign utility to an address
    */

    function add(bytes32 memory sku, uint256 price, uint256 quantity, address debtor, bytes32 memory posId,
      , bytes32 memory description, uint256 memory timestamp) public {
        Transaction transaction = new Transaction();
        transaction.
        item.sku = sku;
        item.price = price;
        item.quantity = quantity;
        item.posID = posId;
        item.description = description;
        item.timestamp = timestamp;
        utility[debtor].push(item);
        dept[debtor] += price;
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

    function getSize(address debtor) public view return (uint256 size) {
      return utility[debtor].length;
    }

}
