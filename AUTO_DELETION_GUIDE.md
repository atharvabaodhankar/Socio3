# 🛡️ Auto-Deletion System Guide

## Overview
Socio3 uses an intelligent auto-deletion system to maintain content quality and community safety. Posts are automatically removed based on community reports and engagement metrics.

## 🎯 Deletion Scenarios

### Scenario 1: High Report Threshold
**Condition:** `reports >= 5`  
**Action:** Immediate removal  
**Reason:** "Automatically removed: Exceeded report threshold"

**Examples:**
- 5 reports + 0 likes = ❌ REMOVED
- 5 reports + 10 likes = ❌ REMOVED  
- 5 reports + 100 likes = ❌ REMOVED

### Scenario 2: Low Engagement + Multiple Reports
**Condition:** `likes == 0 && reports >= 3`  
**Action:** Faster removal for unpopular content  
**Reason:** "Automatically removed: Multiple reports on low-engagement content"

**Examples:**
- 0 likes + 3 reports = ❌ REMOVED
- 0 likes + 2 reports = ✅ SAFE
- 1 like + 3 reports = ✅ SAFE (doesn't meet condition)

### Scenario 3: Report-to-Like Ratio (Future Implementation)
**Condition:** `reports >= (likes × 2)`  
**Action:** Removal when reports significantly exceed engagement  
**Reason:** "Automatically removed: High report-to-like ratio"

**Examples:**
- 1 like + 2 reports = ❌ REMOVED
- 2 likes + 4 reports = ❌ REMOVED
- 5 likes + 10 reports = ❌ REMOVED
- 10 likes + 15 reports = ✅ SAFE (15 < 20)

## 📊 Current Implementation Status

### ✅ Currently Active
- **High Report Threshold** (5+ reports)
- **Low Engagement Filter** (0 likes + 3+ reports)
- **Duplicate Report Prevention** (one report per user per post)
- **Blockchain Logging** (all actions recorded)

### 🔄 In Development
- **Report-to-Like Ratio** (requires SocialContract integration)
- **Appeal System** (for wrongly removed posts)
- **Graduated Penalties** (warnings before removal)
- **Community Voting** (let users vote on borderline cases)

## 🔔 User Notifications

When a post is removed, the author receives:

### Notification Content
```
📧 Subject: Your post has been removed from Socio3

Dear Creator,

Your post (ID: #123) has been automatically removed from Socio3.

Reason: Automatically removed: Exceeded report threshold
Reports: 5
Likes: 2
Report Types: Spam (3), Inappropriate Content (2)

This action was taken automatically based on community reports. 
If you believe this was an error, please review our community 
guidelines and consider the feedback from other users.

Best regards,
Socio3 Moderation System
```

### Notification Delivery
- 📱 **In-App Notification** (when user visits the platform)
- 🔔 **Browser Notification** (if enabled)
- 📧 **Email** (future feature)

## 🛠️ Admin Controls

### Manual Override
Admins can manually remove posts using:
```solidity
manuallyRemovePost(uint256 _postId, string _reason)
```

### Threshold Adjustment
Admins can adjust the report threshold:
```solidity
setReportThreshold(uint256 _threshold) // Default: 5
```

### View Removed Posts
Admins can see all removed posts:
```solidity
getRemovedPosts() // Returns array of removed posts
```

## 🎮 Testing the System

### Test Scenario 1: High Reports
1. Create a test post
2. Get 5 different accounts to report it
3. Post should be automatically removed
4. Author should receive notification

### Test Scenario 2: Low Engagement
1. Create a post that gets no likes
2. Get 3 accounts to report it
3. Post should be removed faster than high-engagement posts

### Test Scenario 3: Popular Content
1. Create a post that gets many likes
2. Get some reports (less than threshold)
3. Post should remain visible due to positive engagement

## 📈 Analytics & Monitoring

### Admin Dashboard Metrics
- **Total Reports**: All-time report count
- **Pending Reports**: Reports awaiting review
- **Removed Posts**: Auto-removed content count
- **Report Types**: Breakdown by category
- **Response Time**: Average time from report to action

### Report Categories Breakdown
1. **Spam** (Type 1): Repetitive/unwanted content
2. **Inappropriate** (Type 2): Offensive material
3. **Harassment** (Type 3): Bullying/targeting
4. **Copyright** (Type 4): Unauthorized content
5. **Other** (Type 5): Miscellaneous violations

## 🔒 Security Features

### Anti-Abuse Measures
- **One Report Per User**: Prevents spam reporting
- **Blockchain Verification**: All reports verified on-chain
- **Admin Oversight**: Manual review capability
- **Transparent Process**: All actions publicly auditable

### Privacy Protection
- **Anonymous Reports**: Reporter identity protected
- **Secure Storage**: Reports encrypted in Firebase
- **Data Retention**: Reports kept for audit purposes
- **GDPR Compliance**: User data rights respected

## 🚀 Future Enhancements

### Planned Features
- **AI Content Analysis**: Automatic detection of problematic content
- **Community Jury**: User voting on borderline cases
- **Reputation System**: Trusted users have more weight
- **Appeal Process**: Users can contest removals
- **Graduated Penalties**: Warnings before removal

### Integration Roadmap
- **Cross-Platform Sync**: Share moderation across platforms
- **External APIs**: Integrate with content verification services
- **Machine Learning**: Improve detection accuracy over time
- **Real-time Monitoring**: Instant response to violations

---

## 📞 Support

For questions about the auto-deletion system:
- 📖 **Documentation**: Check this guide and README.md
- 🐛 **Issues**: Report bugs on GitHub
- 💬 **Community**: Join our Discord for discussions
- 📧 **Contact**: Reach out to the development team

**Remember**: The goal is to maintain a safe, welcoming community while preserving free expression and decentralization principles.