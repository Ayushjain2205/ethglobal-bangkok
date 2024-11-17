// ***********************************************
// ▗▖  ▗▖ ▗▄▖ ▗▖  ▗▖▗▄▄▄▖ ▗▄▄▖▗▄▄▄▖▗▄▖ ▗▖  ▗▖▗▄▄▄▖
// ▐▛▚▖▐▌▐▌ ▐▌▐▛▚▞▜▌▐▌   ▐▌     █ ▐▌ ▐▌▐▛▚▖▐▌▐▌
// ▐▌ ▝▜▌▐▛▀▜▌▐▌  ▐▌▐▛▀▀▘ ▝▀▚▖  █ ▐▌ ▐▌▐▌ ▝▜▌▐▛▀▀▘
// ▐▌  ▐▌▐▌ ▐▌▐▌  ▐▌▐▙▄▄▖▗▄▄▞▘  █ ▝▚▄▞▘▐▌  ▐▌▐▙▄▄▖
// ***********************************************

// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/// @author darianb.eth
/// @custom:project Durin
/// @custom:company NameStone

import {IL2Registry} from "./IL2Registry.sol";

/// @notice Thrown when attempting to interact with a non-existent token
error ERC721NonexistentToken(uint256 tokenId);

/// @title Registrar (for Layer 2)
/// @dev This is a simple registrar contract that is mean to be modified.
contract L2Registrar {
    /// @notice Emitted when a new name is registered
    /// @param label The registered name
    /// @param owner The owner of the newly registered name
    event NameRegistered(string indexed label, address indexed owner);

    /// @notice Reference to the target registry contract
    /// @dev Immutable to save gas and prevent manipulation
    IL2Registry public immutable targetRegistry;

    /// @notice Initializes the registrar with a registry contract
    /// @param _registry Address of the L2Registry contract
    constructor(IL2Registry _registry) {
        targetRegistry = _registry;
    }

    /// @notice Checks if a given tokenId is available for registration
    /// @param tokenId The tokenId to check availability for
    /// @return available True if the tokenId can be registered, false if already taken
    /// @dev Uses try-catch to handle the ERC721NonexistentToken error
    function available(uint256 tokenId) external view returns (bool) {
        try targetRegistry.ownerOf(tokenId) returns (address) {
            // Token exists and has an owner
            return false;
        } catch (bytes memory reason) {
            // Check if the error is specifically ERC721NonexistentToken
            if (
                keccak256(reason) ==
                keccak256(
                    abi.encodeWithSelector(
                        ERC721NonexistentToken.selector,
                        tokenId
                    )
                )
            ) {
                // Token doesn't exist, so it's available
                return true;
            } else {
                // Propagate any other errors
                revert(string(reason));
            }
        }
    }

    /// @notice Registers a new name
    /// @param label The name to register
    /// @param owner The address that will own the name
    function register(string memory label, address owner) external {
        targetRegistry.register(label, owner);
        // Set the mainnet resolved address
        targetRegistry.setAddr(
            keccak256(bytes(label)), // Convert label to bytes32 hash
            60, // Mainnet coinType
            abi.encodePacked(owner) // Convert address to bytes
        );
        emit NameRegistered(label, owner);
    }
}
