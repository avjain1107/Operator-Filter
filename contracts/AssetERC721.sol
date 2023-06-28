// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;
import "./IERC721.sol";
import {DefaultOperatorFiltererUpgradeable} from "./DefaultOperatorFiltererUpgradable.sol";
import {OperatorFiltererUpgradeable} from "./OperatorFiltererUpgradable.sol";

contract AssetERC721 is IERC721, OperatorFiltererUpgradeable {
    address private contractOwner;
    uint256 private tokenId = 1;
    mapping(uint256 => address) private _owner;
    mapping(uint256 => address) private approved;
    mapping(address => uint256) private balance;
    mapping(address => mapping(address => bool)) approvalForAll;

    constructor() {
        contractOwner = msg.sender;
    }

    modifier onlyOwner() {
        require(
            msg.sender == contractOwner,
            "AssetERC721: Only owner can mint."
        );
        _;
    }

    function mint(address to) external onlyOwner returns (uint256) {
        require(to != address(0), "AssetERC721 : Cannot mint to zero address");
        uint256 _tokenId = tokenId++;
        balance[to] += 1;
        _owner[_tokenId] = to;
        emit Transfer(address(0), to, _tokenId);
        return _tokenId;
    }

    function balanceOf(address owner) external view returns (uint256) {
        return balance[owner];
    }

    function ownerOf(uint256 _tokenId) external view returns (address) {
        return _owner[_tokenId];
    }

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId,
        bytes memory _data
    ) external override onlyAllowedOperatorApproval(msg.sender) {
        _safetransferFrom(_from, _to, _tokenId, _data);
    }

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) external override onlyAllowedOperatorApproval(msg.sender) {
        _safetransferFrom(_from, _to, _tokenId, "");
    }

    function _safetransferFrom(
        address _from,
        address _to,
        uint256 _tokenId,
        bytes memory _data
    ) internal {
        _transferFrom(_from, _to, _tokenId);
        uint256 size;
        assembly {
            size := extcodesize(_to)
        }
        require(size > 0, "AssetERC721: _to is not a contract account");
        bytes4 returnData = IERC721Receiver(_to).onERC721Received(
            msg.sender,
            _from,
            _tokenId,
            _data
        );
        require(
            returnData ==
                bytes4(
                    keccak256("onERC721Received(address,address,uint256,bytes)")
                ),
            "AssetERC721: _to contract does not implement ERC721Received"
        );
        emit Transfer(_from, _to, _tokenId);
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) external override onlyAllowedOperatorApproval(msg.sender) {
        _transferFrom(_from, _to, _tokenId);
    }

    function _transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) internal {
        require(
            msg.sender == _from ||
                approvalForAll[_from][msg.sender] == true ||
                approved[_tokenId] == msg.sender,
            "can not send token"
        );
        require(
            _owner[_tokenId] == _from,
            "AssetERC721: no such token available"
        );
        delete approved[_tokenId];
        _owner[_tokenId] = _to;
        balance[_from] -= 1;
        balance[_to] += 1;
        emit Transfer(_from, _to, _tokenId);
    }

    function approve(
        address _approved,
        uint256 _tokenId
    ) external override onlyAllowedOperatorApproval(_approved) {
        require(
            _approved != address(0),
            "cAssetERC721: an not approve zero address"
        );
        require(_owner[_tokenId] == msg.sender, "AssetERC721: can not approve");
        approved[_tokenId] = _approved;
        emit Approval(msg.sender, _approved, _tokenId);
    }

    function setApprovalForAll(
        address _operator,
        bool _approved
    ) external override onlyAllowedOperatorApproval(_operator) {
        require(
            _operator != address(0),
            "AssetERC721: can not approve zero address"
        );
        approvalForAll[msg.sender][_operator] = _approved;
        emit ApprovalForAll(msg.sender, _operator, _approved);
    }

    function getApproved(uint256 _tokenId) external view returns (address) {
        return approved[_tokenId];
    }

    function isApprovedForAll(
        address owner,
        address _operator
    ) external view returns (bool) {
        return approvalForAll[owner][_operator];
    }
}
