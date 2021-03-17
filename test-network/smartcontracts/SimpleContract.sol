// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;

contract SimpleContract {
    string private message = "My First Smart Contract";

    function getMessage() public view returns(string memory) {
        return message;
    }

    function setMessage(string memory newMessage) public {
        message = newMessage;
    }
}