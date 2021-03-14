// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <=0.8.2;

interface IRewardToken {
    function burn(address sender, uint256 amount) external;
    function mint(address receiver, uint256 amount) external;
    function transferTo(address _from, address _to, uint _value) external;
}