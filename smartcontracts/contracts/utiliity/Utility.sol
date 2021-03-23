pragma solidity ~0.8.2;

/**
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
    struct Item {
        string sku;
        string posID;
        
    }

}
