progma solidity ^0.8.2;

/*
*
*/

contract Item {

    bytes32 sku;
    uint256 price;
    uint256 quantity;
    bytes32 desciption;

    constructor(
        bytes32 _sku,
        uint256 _price,
        uint256 _quantity,
        bytes32 _description) {
        sku = _sku;
        price = _price;
        quantity = _quantity;
        desciption = _description;
      }

}
