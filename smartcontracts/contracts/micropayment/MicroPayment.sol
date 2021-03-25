// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

interface IRewardToken {
    function transferTo(address _from, address _to, uint _value) external;
    function balanceUnsettledOf(address who) external view returns (uint, uint);
}

contract MicroPayment {

    address public owner; // authorize transfer between two parties
    uint public pageSize = 20;

    IRewardToken private rewardToken;

    struct TransactionRecord {
        address sender;
        address receiver;
        uint256 amount;
        address transactionReference;
        bytes32 transactionType;
    }

    mapping (address => TransactionRecord[]) public transactionRecords;

    constructor (address _rewardToken) {
        owner = msg.sender;

        // Contract RewardToken needs to invoke the method setAuthorized(address)
        // where "address" is the address of the contract MicroPayment
        rewardToken = IRewardToken(_rewardToken);
    }


    event Transfer(address sender, address receiver, uint256 amount, address transactionReference);

    function transfer(address receiver, uint256 amount, bytes32 transactionType, address transactionReference) public {
        address sender = msg.sender;
        rewardToken.transferTo(sender, receiver, amount);

        TransactionRecord memory record;
        record.sender = sender;
        record.receiver = receiver;
        record.amount = amount;
        record.transactionType = transactionType;
        record.transactionReference = transactionReference;

        transactionRecords[receiver].push(record);
        transactionRecords[sender].push(record);

        emit Transfer(sender, receiver, amount, transactionReference);
    }
    /**
    * @dev Gets the balance of the specified address.
    * @param who The address to query the balance of.
    * return the balance and unsettled balance owned by the passed address.
    */
    function balanceOf(address who) public view returns (uint balance, uint unsettledBalance) {
        return rewardToken.balanceUnsettledOf(who);
    }

    function getTransactionRecords(address who, uint _page) public view returns 
        (address[] memory senders, 
         address[] memory receivers,
         uint256[] memory amounts,
         address[] memory txRefs,
         bytes32[] memory txTypes)
    {
        _page = _page == 0?1: _page;

        uint from = (_page - 1)*pageSize;
        uint to = _page*pageSize;
        uint length = transactionRecords[who].length;

        if(length <= from) {
            address[] memory addList = new address[](1);
            uint256[] memory amountList = new uint256[](1);
            bytes32[] memory typeList = new bytes32[](1);
            return (addList, addList, amountList, addList, typeList);
        } else {
            TransactionRecord[] memory records = transactionRecords[who];
            to = to > length?length:to;
            uint aSize = to - from;
            address[] memory sendersList = new address[](aSize);
            address[] memory receiversList = new address[](aSize);
            uint256[] memory amountList = new uint256[](aSize);
            address[] memory referenceList = new address[](aSize);
            bytes32[] memory typeList = new bytes32[](aSize);

            for(uint idx = 0; idx < aSize; idx++) {
                TransactionRecord memory record = records[from+idx];

                sendersList[idx] = record.sender;
                receiversList[idx] = record.receiver;
                amountList[idx] = record.amount;
                referenceList[idx] = record.transactionReference;
                typeList[idx] = record.transactionType;
            }

            return (sendersList, receiversList, amountList, referenceList, typeList);
        }
    }
}
