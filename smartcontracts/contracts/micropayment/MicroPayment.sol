// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

interface IRewardToken {
    function transferTo(address _from, address _to, uint _value) external;
    function balanceUnsettledOf(address who) external view returns (uint, uint);
    function mint(address receiver, uint256 amount) external;
    function burn(address sender, uint256 amount) external;
}

contract MicroPayment {

    address public owner; // authorize transfer between two parties
    uint public pageSize = 20;
    uint256 public transactionCap = 100000;
    modifier onlyAdmin {
        require(msg.sender == owner, "Caller is not admin");
        _;
    }

    IRewardToken private rewardToken;

    struct TransactionRecord {
        address sender;
        address receiver;
        uint256 amount;
        bytes32 transactionReference;
        bytes32 transactionType;
        uint transactionTime;
    }

    mapping (address => TransactionRecord[]) public transactionRecords;

    constructor (address _rewardToken) {
        owner = msg.sender;

        // Contract RewardToken needs to invoke the method setAuthorized(address)
        // where "address" is the address of the contract MicroPayment
        rewardToken = IRewardToken(_rewardToken);
    }


    event Transfer(address sender, address receiver, uint256 amount, bytes32 transactionReference);

    function transfer(address receiver, uint256 amount, bytes32 transactionType, bytes32 transactionReference) public {
        address sender = msg.sender;
        require(amount <= transactionCap, "exceed the transaction cap!");
        rewardToken.transferTo(sender, receiver, amount);

        TransactionRecord memory record;
        record.sender = sender;
        record.receiver = receiver;
        record.amount = amount;
        record.transactionType = transactionType;
        record.transactionReference = transactionReference;
        record.transactionTime = block.timestamp;

        transactionRecords[receiver].push(record);
        transactionRecords[sender].push(record);

        emit Transfer(sender, receiver, amount, transactionReference);
    }

    function mint(address receiver, uint256 amount) public onlyAdmin returns (bool) {
        rewardToken.mint(receiver, amount);
        return true;
    }

    function burn(address sender, uint256 amount) public onlyAdmin returns (bool) {
        rewardToken.burn(sender, amount);
        return true;
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
         bytes32[] memory txRefs,
         bytes32[] memory txTypes,
         uint[] memory txTimes)
    {
        address[] memory sendersList;
        address[] memory receiversList;
        uint256[] memory amountList;
        bytes32[] memory referenceList;
        bytes32[] memory typeList;
        uint[] memory times;

        (sendersList, receiversList, amountList) = _getSubList1(who, _page);
        (referenceList, typeList, times) = _getSubList2(who, _page);

        return (sendersList, receiversList, amountList, referenceList, typeList, times);
    }

    function _getSubList1(address who, uint _page) internal view returns (
        address[] memory senders, 
        address[] memory receivers,
        uint256[] memory amounts) 
    {

        _page = _page == 0?1: _page;

        uint from = (_page - 1)*pageSize;
        uint to = _page*pageSize;
        uint length = transactionRecords[who].length;

        if(length <= from) {
            address[] memory addList = new address[](1);
            uint256[] memory amountList = new uint256[](1);
            return (addList, addList, amountList);
        } else {
            TransactionRecord[] memory records = transactionRecords[who];
            to = to > length?length:to;
            uint aSize = to - from;
            address[] memory sendersList = new address[](aSize);
            address[] memory receiversList = new address[](aSize);
            uint256[] memory amountList = new uint256[](aSize);

            for(uint idx = 0; idx < aSize; idx++) {
                TransactionRecord memory record = records[from+idx];

                sendersList[idx] = record.sender;
                receiversList[idx] = record.receiver;
                amountList[idx] = record.amount;
            }

            return (sendersList, receiversList, amountList);
        }
    }

    function _getSubList2(address who, uint _page) internal view returns (
        bytes32[] memory txRefs,
        bytes32[] memory txTypes,
        uint[] memory txTimes) 
    {

        _page = _page == 0?1: _page;

        uint from = (_page - 1)*pageSize;
        uint to = _page*pageSize;
        uint length = transactionRecords[who].length;

        if(length <= from) {
            bytes32[] memory typeList = new bytes32[](1);
            uint[] memory times = new uint[](1);
            return (typeList, typeList, times);
        } else {
            TransactionRecord[] memory records = transactionRecords[who];
            to = to > length?length:to;
            uint aSize = to - from;
            bytes32[] memory referenceList = new bytes32[](aSize);
            bytes32[] memory typeList = new bytes32[](aSize);
            uint[] memory times = new uint[](aSize);

            for(uint idx = 0; idx < aSize; idx++) {
                TransactionRecord memory record = records[from+idx];

                referenceList[idx] = record.transactionReference;
                typeList[idx] = record.transactionType;
                times[idx] = record.transactionTime;
            }

            return (referenceList, typeList, times);
        }
    }

    event SetTransactionCap(uint256 amount);

    function setTransactionCap(uint256 _transactionCap) public {

        transactionCap = _transactionCap;
        emit SetTransactionCap(transactionCap);
    }
}
