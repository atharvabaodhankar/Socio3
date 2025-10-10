// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ProfileContract {
    struct Profile {
        string ipfsHash;        // IPFS hash containing profile data
        uint256 timestamp;      // When profile was created/updated
        bool exists;           // Whether profile exists
    }
    
    mapping(address => Profile) public profiles;
    mapping(string => address) public usernameToAddress;
    mapping(address => string) public addressToUsername;
    
    event ProfileCreated(address indexed user, string ipfsHash, string username, uint256 timestamp);
    event ProfileUpdated(address indexed user, string ipfsHash, uint256 timestamp);
    event UsernameChanged(address indexed user, string oldUsername, string newUsername);
    
    modifier onlyProfileOwner() {
        require(profiles[msg.sender].exists, "Profile does not exist");
        _;
    }
    
    modifier validUsername(string memory username) {
        require(bytes(username).length >= 3 && bytes(username).length <= 20, "Username must be 3-20 characters");
        require(usernameToAddress[username] == address(0) || usernameToAddress[username] == msg.sender, "Username already taken");
        _;
    }
    
    function createProfile(string memory ipfsHash, string memory username) external validUsername(username) {
        require(!profiles[msg.sender].exists, "Profile already exists");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        // Update username mappings
        if (bytes(username).length > 0) {
            usernameToAddress[username] = msg.sender;
            addressToUsername[msg.sender] = username;
        }
        
        profiles[msg.sender] = Profile({
            ipfsHash: ipfsHash,
            timestamp: block.timestamp,
            exists: true
        });
        
        emit ProfileCreated(msg.sender, ipfsHash, username, block.timestamp);
    }
    
    function updateProfile(string memory ipfsHash) external onlyProfileOwner {
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        profiles[msg.sender].ipfsHash = ipfsHash;
        profiles[msg.sender].timestamp = block.timestamp;
        
        emit ProfileUpdated(msg.sender, ipfsHash, block.timestamp);
    }
    
    function updateUsername(string memory newUsername) external onlyProfileOwner validUsername(newUsername) {
        string memory oldUsername = addressToUsername[msg.sender];
        
        // Clear old username mapping
        if (bytes(oldUsername).length > 0) {
            delete usernameToAddress[oldUsername];
        }
        
        // Set new username mapping
        usernameToAddress[newUsername] = msg.sender;
        addressToUsername[msg.sender] = newUsername;
        
        emit UsernameChanged(msg.sender, oldUsername, newUsername);
    }
    
    function getProfile(address user) external view returns (string memory ipfsHash, uint256 timestamp, bool exists) {
        Profile memory profile = profiles[user];
        return (profile.ipfsHash, profile.timestamp, profile.exists);
    }
    
    function getUsername(address user) external view returns (string memory) {
        return addressToUsername[user];
    }
    
    function getUserByUsername(string memory username) external view returns (address) {
        return usernameToAddress[username];
    }
    
    function hasProfile(address user) external view returns (bool) {
        return profiles[user].exists;
    }
    
    function isUsernameAvailable(string memory username) external view returns (bool) {
        return usernameToAddress[username] == address(0);
    }
}