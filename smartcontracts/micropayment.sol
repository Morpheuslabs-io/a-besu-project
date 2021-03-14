pragma solidity ^0.8.2;

contract MicroPayment {

    address public owner; // authorize transfer between two parties

    struct TransactionRecords {
        address sender;
        address receiver;
        uint256 amount;
        address transactionReference;
        string transactionType;
    }

    mapping (address => TransactionRecord[]) public transactionRecords;

    constructor (address _minter_address, address _burner_address) {
        owner = msg.sender;
    }

    event Mint(address receiver, uint256 amount);

    function mint(address receiver, uint256 amount) public {
        require(msg.sender = owner);
        // here need to call RewordToken mint function

        TransactionRecord memory record;
        record.sender = msg.sender;
        record.receiver = receiver;
        record.amount = amount;
        record.transactionType = 'Mint';

        transactionRecords[sender].push(record);
        emit Mint(receiver, amount);

    }

    event Burn(address sender, uint256 amount);

    function Burn(address sender, uint256 amount) public {
        require(msg.sender == owner);
        require(balance[sender]>amount);
        // here need to call RewordToken burn function

        TransactionRecord memory record;
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
        // here need to call RewordToken transferTo function

        TransactionRecord memory record;
        record.sender = sender;
        record.receiver = receiver;
        record.amount = amount;
        record.transactionReference = transactionReference;
        if (transactionReference == 0x0000000000000000000000000000000000000000) {
            if (sender == owner_address) {
                record.transactionType = 'Top-Up'; // if the bank (msg signer) is sending the funds
            }
            else if (receiver == owner_address) {
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
