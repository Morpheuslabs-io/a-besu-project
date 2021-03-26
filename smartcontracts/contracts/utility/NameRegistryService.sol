// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;


contract NameRegistryService {
    address public admin;
    modifier onlyAdmin {
        require(msg.sender == admin, "Caller is not admin");
        _;
    }

    mapping(string => address) internal nameMapping;

    constructor() {
        admin = msg.sender;
    }

    function register(string memory _name, address _contractAddress) public onlyAdmin {
        require(_contractAddress != address(0), 'Invalid contract address');
        require(nameMapping[_name] == address(0), 'Naming is already in use');

        nameMapping[_name] = _contractAddress;
    }

    function modifyAddress(string memory _name, address _contractAddress) public onlyAdmin {
        require(_contractAddress != address(0), 'Invalid contract address');
        nameMapping[_name] = _contractAddress;
    }

    function getContractAddress(string memory _name) public view returns(address) {
        return nameMapping[_name];
    }
}
