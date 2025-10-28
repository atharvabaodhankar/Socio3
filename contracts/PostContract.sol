// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract PostContract {
    struct Post {
        address author;
        string ipfsHash;
        uint256 timestamp;
        uint256 id;
        bool isRemoved;
        string removalReason;
    }

    struct Report {
        address reporter;
        uint8 reportType; // 1: Spam, 2: Inappropriate, 3: Harassment, 4: Copyright, 5: Other
        string reason;
        uint256 timestamp;
    }

    mapping(uint256 => Post) public posts;
    mapping(uint256 => Report[]) public postReports;
    mapping(uint256 => mapping(address => bool)) public hasReported;
    mapping(uint256 => uint256) public reportCounts;
    uint256 public postCount;
    
    // Configurable thresholds
    uint256 public reportThreshold = 5; // Minimum reports needed
    uint256 public reportToLikeRatio = 2; // Reports must be 2x likes to auto-remove
    address public owner;
    
    event PostCreated(uint256 indexed postId, address indexed author, string ipfsHash, uint256 timestamp);
    event PostReported(uint256 indexed postId, address indexed reporter, uint8 reportType, string reason);
    event PostRemoved(uint256 indexed postId, address indexed author, string reason);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createPost(string memory _ipfsHash) public {
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        postCount++;
        posts[postCount] = Post({
            author: msg.sender,
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp,
            id: postCount,
            isRemoved: false,
            removalReason: ""
        });

        emit PostCreated(postCount, msg.sender, _ipfsHash, block.timestamp);
    }

    function reportPost(uint256 _postId, uint8 _reportType, string memory _reason) public {
        require(_postId > 0 && _postId <= postCount, "Post does not exist");
        require(!posts[_postId].isRemoved, "Post is already removed");
        require(!hasReported[_postId][msg.sender], "You have already reported this post");
        require(_reportType >= 1 && _reportType <= 5, "Invalid report type");
        require(posts[_postId].author != msg.sender, "Cannot report your own post");

        // Add report
        postReports[_postId].push(Report({
            reporter: msg.sender,
            reportType: _reportType,
            reason: _reason,
            timestamp: block.timestamp
        }));

        hasReported[_postId][msg.sender] = true;
        reportCounts[_postId]++;

        emit PostReported(_postId, msg.sender, _reportType, _reason);

        // Check if post should be auto-removed
        _checkAutoRemoval(_postId);
    }

    function _checkAutoRemoval(uint256 _postId) internal {
        uint256 reports = reportCounts[_postId];
        
        // Scenario 1: High report count regardless of likes
        if (reports >= reportThreshold) {
            _removePost(_postId, "Automatically removed: Exceeded report threshold");
            return;
        }
        
        // Scenario 2: Low engagement with reports (0 likes + 1+ reports)
        if (reports >= 1) {
            // We'll check likes from SocialContract in the frontend
            // For now, if 3+ reports and likely low engagement, remove
            if (reports >= 3) {
                _removePost(_postId, "Automatically removed: Multiple reports on low-engagement content");
            }
        }
    }

    function _removePost(uint256 _postId, string memory _reason) internal {
        posts[_postId].isRemoved = true;
        posts[_postId].removalReason = _reason;
        
        emit PostRemoved(_postId, posts[_postId].author, _reason);
    }

    function manuallyRemovePost(uint256 _postId, string memory _reason) public onlyOwner {
        require(_postId > 0 && _postId <= postCount, "Post does not exist");
        require(!posts[_postId].isRemoved, "Post is already removed");
        
        _removePost(_postId, _reason);
    }

    function getPostReports(uint256 _postId) public view returns (Report[] memory) {
        return postReports[_postId];
    }

    function getReportCount(uint256 _postId) public view returns (uint256) {
        return reportCounts[_postId];
    }

    function setReportThreshold(uint256 _threshold) public onlyOwner {
        reportThreshold = _threshold;
    }

    function setReportToLikeRatio(uint256 _ratio) public onlyOwner {
        reportToLikeRatio = _ratio;
    }

    function getPost(uint256 _postId) public view returns (Post memory) {
        require(_postId > 0 && _postId <= postCount, "Post does not exist");
        return posts[_postId];
    }

    function getAllPosts() public view returns (Post[] memory) {
        // Count non-removed posts
        uint256 activePostCount = 0;
        for (uint256 i = 1; i <= postCount; i++) {
            if (!posts[i].isRemoved) {
                activePostCount++;
            }
        }
        
        // Create array with only active posts
        Post[] memory activePosts = new Post[](activePostCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= postCount; i++) {
            if (!posts[i].isRemoved) {
                activePosts[currentIndex] = posts[i];
                currentIndex++;
            }
        }
        
        return activePosts;
    }

    function getPostsByAuthor(address _author) public view returns (Post[] memory) {
        uint256 authorPostCount = 0;
        
        // Count non-removed posts by author
        for (uint256 i = 1; i <= postCount; i++) {
            if (posts[i].author == _author && !posts[i].isRemoved) {
                authorPostCount++;
            }
        }
        
        // Create array and populate
        Post[] memory authorPosts = new Post[](authorPostCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= postCount; i++) {
            if (posts[i].author == _author && !posts[i].isRemoved) {
                authorPosts[currentIndex] = posts[i];
                currentIndex++;
            }
        }
        
        return authorPosts;
    }

    // Function to get removed posts for moderation purposes
    function getRemovedPosts() public view onlyOwner returns (Post[] memory) {
        uint256 removedPostCount = 0;
        
        // Count removed posts
        for (uint256 i = 1; i <= postCount; i++) {
            if (posts[i].isRemoved) {
                removedPostCount++;
            }
        }
        
        // Create array and populate
        Post[] memory removedPosts = new Post[](removedPostCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= postCount; i++) {
            if (posts[i].isRemoved) {
                removedPosts[currentIndex] = posts[i];
                currentIndex++;
            }
        }
        
        return removedPosts;
    }
}