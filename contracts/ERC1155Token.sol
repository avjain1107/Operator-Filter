// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ERC1155} from "openzeppelin-contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "openzeppelin-contracts/access/Ownable.sol";
// import {DefaultOperatorFiltererUpgradeable} from "./DefaultOperatorFiltererUpgradable.sol";
import {OperatorFiltererUpgradeable} from "./OperatorFiltererUpgradable.sol";

contract ERC1155Token is ERC1155, OperatorFiltererUpgradeable {
    address private owner;

    constructor() ERC1155("") {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "ERC721Token: Only owner can mint.");
        _;
    }

    function mint(address to, uint256 id, uint256 amount) external onlyOwner {
        _mint(to, id, amount, "");
    }
    
}
