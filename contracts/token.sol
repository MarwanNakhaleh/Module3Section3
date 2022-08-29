// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./oz/token/ERC20/ERC20.sol";
import "./oz/token/ERC20/extensions/ERC20Burnable.sol";
import "./oz/access/Ownable.sol";

/// @title MyToken
/// @author Marwan Nakhaleh
/// @notice it compiled!
contract MyToken is ERC20, ERC20Burnable, Ownable {
    constructor() ERC20("MyToken", "MTK") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    /// @dev can only be run by owner
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
