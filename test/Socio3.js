const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Socio3 Contracts", function () {
  let postContract, socialContract;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy PostContract
    const PostContract = await ethers.getContractFactory("PostContract");
    postContract = await PostContract.deploy();

    // Deploy SocialContract
    const SocialContract = await ethers.getContractFactory("SocialContract");
    socialContract = await SocialContract.deploy();
  });

  describe("PostContract", function () {
    it("Should create a post", async function () {
      const ipfsHash = "QmTestHash123";
      
      await postContract.createPost(ipfsHash);
      
      const post = await postContract.getPost(1);
      expect(post.author).to.equal(owner.address);
      expect(post.ipfsHash).to.equal(ipfsHash);
      expect(post.id).to.equal(1);
    });

    it("Should increment post count", async function () {
      await postContract.createPost("QmHash1");
      await postContract.createPost("QmHash2");
      
      const postCount = await postContract.postCount();
      expect(postCount).to.equal(2);
    });

    it("Should get all posts", async function () {
      await postContract.createPost("QmHash1");
      await postContract.connect(addr1).createPost("QmHash2");
      
      const allPosts = await postContract.getAllPosts();
      expect(allPosts.length).to.equal(2);
      expect(allPosts[0].author).to.equal(owner.address);
      expect(allPosts[1].author).to.equal(addr1.address);
    });

    it("Should get posts by author", async function () {
      await postContract.createPost("QmHash1");
      await postContract.createPost("QmHash2");
      await postContract.connect(addr1).createPost("QmHash3");
      
      const ownerPosts = await postContract.getPostsByAuthor(owner.address);
      expect(ownerPosts.length).to.equal(2);
      
      const addr1Posts = await postContract.getPostsByAuthor(addr1.address);
      expect(addr1Posts.length).to.equal(1);
    });
  });

  describe("SocialContract", function () {
    it("Should follow and unfollow users", async function () {
      // Follow user
      await socialContract.followUser(addr1.address);
      
      const isFollowing = await socialContract.isFollowing(owner.address, addr1.address);
      expect(isFollowing).to.be.true;
      
      const followerCount = await socialContract.getFollowerCount(addr1.address);
      expect(followerCount).to.equal(1);
      
      // Unfollow user
      await socialContract.unfollowUser(addr1.address);
      
      const isFollowingAfter = await socialContract.isFollowing(owner.address, addr1.address);
      expect(isFollowingAfter).to.be.false;
      
      const followerCountAfter = await socialContract.getFollowerCount(addr1.address);
      expect(followerCountAfter).to.equal(0);
    });

    it("Should like and unlike posts", async function () {
      const postId = 1;
      
      // Like post
      await socialContract.likePost(postId);
      
      const hasLiked = await socialContract.hasUserLiked(postId, owner.address);
      expect(hasLiked).to.be.true;
      
      const likesCount = await socialContract.getLikesCount(postId);
      expect(likesCount).to.equal(1);
      
      // Unlike post
      await socialContract.unlikePost(postId);
      
      const hasLikedAfter = await socialContract.hasUserLiked(postId, owner.address);
      expect(hasLikedAfter).to.be.false;
      
      const likesCountAfter = await socialContract.getLikesCount(postId);
      expect(likesCountAfter).to.equal(0);
    });

    it("Should tip posts", async function () {
      const postId = 1;
      const tipAmount = ethers.parseEther("0.1");
      
      const initialBalance = await ethers.provider.getBalance(addr1.address);
      
      await socialContract.tipPost(postId, addr1.address, { value: tipAmount });
      
      const finalBalance = await ethers.provider.getBalance(addr1.address);
      expect(finalBalance - initialBalance).to.equal(tipAmount);
      
      const tipsAmount = await socialContract.getTipsAmount(postId);
      expect(tipsAmount).to.equal(tipAmount);
      
      const totalTips = await socialContract.getTotalTipsReceived(addr1.address);
      expect(totalTips).to.equal(tipAmount);
    });

    it("Should prevent following yourself", async function () {
      await expect(socialContract.followUser(owner.address))
        .to.be.revertedWith("Cannot follow yourself");
    });

    it("Should prevent double following", async function () {
      await socialContract.followUser(addr1.address);
      
      await expect(socialContract.followUser(addr1.address))
        .to.be.revertedWith("Already following this user");
    });

    it("Should prevent double liking", async function () {
      const postId = 1;
      await socialContract.likePost(postId);
      
      await expect(socialContract.likePost(postId))
        .to.be.revertedWith("Already liked this post");
    });
  });
});