// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract PostContract {
    struct Post {
        address author;
        string ipfsHash;
        uint256 timestamp;
        uint256 id;
    }

    mapping(uint256 => Post) public posts;
    uint256 public postCount;
    
    event PostCreated(uint256 indexed postId, address indexed author, string ipfsHash, uint256 timestamp);

    function createPost(string memory _ipfsHash) public {
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        postCount++;
        posts[postCount] = Post({
            author: msg.sender,
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp,
            id: postCount
        });

        emit PostCreated(postCount, msg.sender, _ipfsHash, block.timestamp);
    }

    function getPost(uint256 _postId) public view returns (Post memory) {
        require(_postId > 0 && _postId <= postCount, "Post does not exist");
        return posts[_postId];
    }

    function getAllPosts() public view returns (Post[] memory) {
        Post[] memory allPosts = new Post[](postCount);
        for (uint256 i = 1; i <= postCount; i++) {
            allPosts[i - 1] = posts[i];
        }
        return allPosts;
    }

    function getPostsByAuthor(address _author) public view returns (Post[] memory) {
        uint256 authorPostCount = 0;
        
        // Count posts by author
        for (uint256 i = 1; i <= postCount; i++) {
            if (posts[i].author == _author) {
                authorPostCount++;
            }
        }
        
        // Create array and populate
        Post[] memory authorPosts = new Post[](authorPostCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= postCount; i++) {
            if (posts[i].author == _author) {
                authorPosts[currentIndex] = posts[i];
                currentIndex++;
            }
        }
        
        return authorPosts;
    }
}