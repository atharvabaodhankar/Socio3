// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SocialContract {
    // Following system
    mapping(address => mapping(address => bool)) public following;
    mapping(address => uint256) public followerCount;
    mapping(address => uint256) public followingCount;
    
    // Likes system
    mapping(uint256 => mapping(address => bool)) public hasLiked;
    mapping(uint256 => uint256) public likesCount;
    
    // Tips system
    mapping(uint256 => uint256) public tips;
    mapping(address => uint256) public totalTipsReceived;
    
    event UserFollowed(address indexed follower, address indexed followed);
    event UserUnfollowed(address indexed follower, address indexed unfollowed);
    event PostLiked(uint256 indexed postId, address indexed liker);
    event PostUnliked(uint256 indexed postId, address indexed unliker);
    event PostTipped(uint256 indexed postId, address indexed tipper, address indexed recipient, uint256 amount);

    // Following functions
    function followUser(address _user) public {
        require(_user != msg.sender, "Cannot follow yourself");
        require(!following[msg.sender][_user], "Already following this user");
        
        following[msg.sender][_user] = true;
        followerCount[_user]++;
        followingCount[msg.sender]++;
        
        emit UserFollowed(msg.sender, _user);
    }

    function unfollowUser(address _user) public {
        require(following[msg.sender][_user], "Not following this user");
        
        following[msg.sender][_user] = false;
        followerCount[_user]--;
        followingCount[msg.sender]--;
        
        emit UserUnfollowed(msg.sender, _user);
    }

    function isFollowing(address _follower, address _followed) public view returns (bool) {
        return following[_follower][_followed];
    }

    // Likes functions
    function likePost(uint256 _postId) public {
        require(!hasLiked[_postId][msg.sender], "Already liked this post");
        
        hasLiked[_postId][msg.sender] = true;
        likesCount[_postId]++;
        
        emit PostLiked(_postId, msg.sender);
    }

    function unlikePost(uint256 _postId) public {
        require(hasLiked[_postId][msg.sender], "Haven't liked this post");
        
        hasLiked[_postId][msg.sender] = false;
        likesCount[_postId]--;
        
        emit PostUnliked(_postId, msg.sender);
    }

    function hasUserLiked(uint256 _postId, address _user) public view returns (bool) {
        return hasLiked[_postId][_user];
    }

    // Tips functions
    function tipPost(uint256 _postId, address _recipient) public payable {
        require(msg.value > 0, "Tip amount must be greater than 0");
        require(_recipient != address(0), "Invalid recipient address");
        
        tips[_postId] += msg.value;
        totalTipsReceived[_recipient] += msg.value;
        
        // Transfer the tip to the recipient
        payable(_recipient).transfer(msg.value);
        
        emit PostTipped(_postId, msg.sender, _recipient, msg.value);
    }

    // Getter functions
    function getFollowerCount(address _user) public view returns (uint256) {
        return followerCount[_user];
    }

    function getFollowingCount(address _user) public view returns (uint256) {
        return followingCount[_user];
    }

    function getLikesCount(uint256 _postId) public view returns (uint256) {
        return likesCount[_postId];
    }

    function getTipsAmount(uint256 _postId) public view returns (uint256) {
        return tips[_postId];
    }

    function getTotalTipsReceived(address _user) public view returns (uint256) {
        return totalTipsReceived[_user];
    }
}