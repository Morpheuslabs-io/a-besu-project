// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

interface IRewardToken {
    function burn(address sender, uint256 amount) external;
    function mint(address receiver, uint256 amount) external;
    function transferTo(address _from, address _to, uint _value) external;
    function balanceUnsettledOf(address who) external view returns (uint, uint);
}

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


    event Transfer(address sender, address receiver, uint256 amount, address transactionReference);

    function transfer(address receiver, uint256 amount, address transactionReference) public {
        address sender = msg.sender;
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
            else {
                record.transactionType = 'Transfer';
            }
        }
        else {
            record.transactionType = 'Settlement';
        }
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

}
