pragma solidity ^0.8.2;

import "./IRewardToken.sol";

contract MicroPayment {

    address public owner; // authorize transfer between two parties

    IRewardToken private rewardToken;

    struct TransactionRecords {
        address sender;
        address receiver;
        uint256 amount;
        address transactionReference;
        string transactionType;
    }

    mapping (address => TransactionRecords[]) public transactionRecords;

    constructor (address _rewardToken) {
        owner = msg.sender;

        // Contract RewardToken needs to invoke the method setAuthorized(address)
        // where "address" is the address of the contract MicroPayment
        rewardToken = IRewardToken(_rewardToken);
    }

    event Mint(address receiver, uint256 amount);

    function mint(address receiver, uint256 amount) public {
        require(msg.sender = owner);
        
        rewardToken.mint(receiver, amount);

        TransactionRecords memory record;
        record.sender = msg.sender;
        record.receiver = receiver;
        record.amount = amount;
        record.transactionType = 'Mint';

        transactionRecords[sender].push(record);
        emit Mint(receiver, amount);

    }

    event Burn(address sender, uint256 amount);

    function burn(address sender, uint256 amount) public {
        require(msg.sender == owner);
        
        rewardToken.burn(sender, amount);

        TransactionRecords memory record;
        record.sender = sender;
        record.receiver = msg.sender;
        record.amount = amount;
        record.transactionType = 'Burn';

        transactionRecords[sender].push(record);
        emit Burn(sender, amount);

    }

    event Transfer(address sender, address receiver, uint256 amount, address transactionReference);

    function transfer(address sender, address receiver, uint256 amount, address transactionReference) public {
        require(msg.sender == owner);
        
        rewardToken.transferTo(sender, receiver, amount);

        TransactionRecords memory record;
        record.sender = sender;
        record.receiver = receiver;
        record.amount = amount;
        record.transactionReference = transactionReference;
        if (transactionReference == address(0)) {
            if (sender == owner) {
                record.transactionType = 'Top-Up'; // if the bank (msg signer) is sending the funds
            }
            else if (receiver == owner) {
                record.transactionType = 'Redemption'; // if the bank (msg signer) is receiving the funds
            }
            else (
                record.transactionType = 'Transfer';
            )
        }
        else {
            record.transactionType = 'Settlement';
        }
        transactionRecords[receiver].push(record);
        transactionRecords[sender].push(record);
        emit Transfer(address sender, address receiver, uint256 amount, address transactionReference);
    }

}
