// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title NPCFactory
 * @dev Main contract for creating and managing NPCs (Non-Player Characters)
 */
contract NPCFactory is Ownable, ReentrancyGuard {
    struct NPC {
        address wallet; // CDP wallet address
        string subdomain; // ENS subdomain (.npc.eth)
        uint256 createdAt;
        address owner;
        bool isActive;
        uint256[] traits; // Array of trait IDs
        uint256[] children; // Array of child NPC IDs
    }

    mapping(uint256 => NPC) public npcs;
    mapping(address => uint256[]) public userNPCs;
    mapping(string => bool) public subdomainTaken;
    mapping(address => bool) public walletTaken;

    uint256 public npcCount;
    uint256 public breedingCooldown = 24 hours;
    bool public isPaused;

    event NPCCreated(
        uint256 indexed npcId,
        address indexed owner,
        address wallet,
        string subdomain
    );
    event NPCDeactivated(uint256 indexed npcId);
    event NPCReactivated(uint256 indexed npcId);
    event NPCTraitsUpdated(uint256 indexed npcId, uint256[] traits);
    event ChildAdded(uint256 indexed parentId, uint256 indexed childId);

    constructor(address initialOwner) Ownable(initialOwner) {
        npcCount = 0;
        isPaused = false;
    }

    modifier whenNotPaused() {
        require(!isPaused, "Factory is paused");
        _;
    }

    modifier validSubdomain(string memory _subdomain) {
        require(!subdomainTaken[_subdomain], "Subdomain already taken");
        require(bytes(_subdomain).length > 0, "Subdomain cannot be empty");
        require(bytes(_subdomain).length <= 32, "Subdomain too long");
        _;
    }

    modifier validWallet(address _wallet) {
        require(_wallet != address(0), "Invalid wallet address");
        require(!walletTaken[_wallet], "Wallet already assigned");
        _;
    }

    modifier npcExists(uint256 _npcId) {
        require(_npcId > 0 && _npcId <= npcCount, "NPC does not exist");
        _;
    }

    modifier onlyNPCOwner(uint256 _npcId) {
        require(npcs[_npcId].owner == msg.sender, "Not NPC owner");
        _;
    }

    function createNPC(
        address _wallet,
        string memory _subdomain,
        uint256[] memory _traits
    )
        external
        nonReentrant
        whenNotPaused
        validSubdomain(_subdomain)
        validWallet(_wallet)
        returns (uint256)
    {
        npcCount++;

        npcs[npcCount] = NPC({
            wallet: _wallet,
            subdomain: _subdomain,
            createdAt: block.timestamp,
            owner: msg.sender,
            isActive: true,
            traits: _traits,
            children: new uint256[](0)
        });

        userNPCs[msg.sender].push(npcCount);
        subdomainTaken[_subdomain] = true;
        walletTaken[_wallet] = true;

        emit NPCCreated(npcCount, msg.sender, _wallet, _subdomain);
        return npcCount;
    }

    function deactivateNPC(
        uint256 _npcId
    ) external npcExists(_npcId) onlyNPCOwner(_npcId) {
        require(npcs[_npcId].isActive, "NPC already inactive");
        npcs[_npcId].isActive = false;
        emit NPCDeactivated(_npcId);
    }

    function reactivateNPC(
        uint256 _npcId
    ) external onlyOwner npcExists(_npcId) {
        require(!npcs[_npcId].isActive, "NPC already active");
        npcs[_npcId].isActive = true;
        emit NPCReactivated(_npcId);
    }

    function updateTraits(
        uint256 _npcId,
        uint256[] memory _newTraits
    ) external npcExists(_npcId) onlyNPCOwner(_npcId) {
        require(npcs[_npcId].isActive, "NPC is not active");
        npcs[_npcId].traits = _newTraits;
        emit NPCTraitsUpdated(_npcId, _newTraits);
    }

    function addChild(
        uint256 _parentId,
        uint256 _childId
    ) external npcExists(_parentId) npcExists(_childId) {
        require(
            msg.sender == owner() || msg.sender == address(this),
            "Not authorized"
        );
        require(_parentId != _childId, "Cannot add self as child");

        npcs[_parentId].children.push(_childId);
        emit ChildAdded(_parentId, _childId);
    }

    function getNPC(
        uint256 _npcId
    )
        external
        view
        npcExists(_npcId)
        returns (
            address wallet,
            string memory subdomain,
            uint256 createdAt,
            address owner,
            bool isActive,
            uint256[] memory traits,
            uint256[] memory children
        )
    {
        NPC storage npc = npcs[_npcId];
        return (
            npc.wallet,
            npc.subdomain,
            npc.createdAt,
            npc.owner,
            npc.isActive,
            npc.traits,
            npc.children
        );
    }

    function getUserNPCs(
        address _user
    ) external view returns (uint256[] memory) {
        return userNPCs[_user];
    }

    function setBreedingCooldown(uint256 _cooldown) external onlyOwner {
        breedingCooldown = _cooldown;
    }

    function togglePause() external onlyOwner {
        isPaused = !isPaused;
    }

    function isWalletAvailable(address _wallet) external view returns (bool) {
        return !walletTaken[_wallet];
    }

    function isSubdomainAvailable(
        string memory _subdomain
    ) external view returns (bool) {
        return !subdomainTaken[_subdomain];
    }

    function updateNPCOwner(
        uint256 _npcId,
        address _newOwner
    ) external npcExists(_npcId) onlyNPCOwner(_npcId) {
        require(_newOwner != address(0), "Invalid new owner address");
        npcs[_npcId].owner = _newOwner;
        // Update userNPCs mapping
        uint256[] storage oldOwnerNPCs = userNPCs[msg.sender];
        for (uint i = 0; i < oldOwnerNPCs.length; i++) {
            if (oldOwnerNPCs[i] == _npcId) {
                oldOwnerNPCs[i] = oldOwnerNPCs[oldOwnerNPCs.length - 1];
                oldOwnerNPCs.pop();
                break;
            }
        }
        userNPCs[_newOwner].push(_npcId);
    }

    function getChildrenCount(
        uint256 _npcId
    ) external view npcExists(_npcId) returns (uint256) {
        return npcs[_npcId].children.length;
    }

    function isNPCActive(
        uint256 _npcId
    ) external view npcExists(_npcId) returns (bool) {
        return npcs[_npcId].isActive;
    }
}
