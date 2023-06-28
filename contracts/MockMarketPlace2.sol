// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;
import {IERC721} from "./IERC721.sol";

contract MockMarketPlace2 {
    function transferTokenForERC721(
        address tokenContract,
        address from,
        address to,
        uint256 id
    ) external {
        IERC721(tokenContract).transferFrom(from, to, id);
    }
}
