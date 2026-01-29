import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import {
    subscribeToMyChats,
    subscribeToMessages,
    sendMessage,
    subscribeToUserStatus,
    deleteMessage,
    editMessage,
    addReaction
} from '../services/firebaseService';
import { getUserProfile, getDisplayName } from '../services/profileService';
import { getIPFSUrl } from '../config/pinata';

const Messages = () => {
    const navigate = useNavigate();
    const { account, isConnected, provider, formatAddress } = useWeb3();
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [chatProfiles, setChatProfiles] = useState({});
    const [userStatuses, setUserStatuses] = useState({});
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editText, setEditText] = useState('');
    const [showReactionPicker, setShowReactionPicker] = useState(null);
    const [hoveredMessage, setHoveredMessage] = useState(null);
    const messagesEndRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const reactionPickerRef = useRef(null);

    // Common emojis
    const emojis = [
        '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
        '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
        '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
        '🤪', '🤨', '🧐', '🤓', '😎', '🥳', '😏', '😒',
        '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖',
        '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡',
        '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰',
        '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶',
        '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮',
        '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙',
        '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✊', '👊',
        '🤛', '🤜', '💪', '🦾', '🦿', '🦵', '🦶', '👂',
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
        '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
        '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️',
        '🎉', '🎊', '🎁', '🎈', '🎀', '🎂', '🍰', '🧁',
        '🔥', '💯', '💢', '💥', '💫', '💦', '💨', '🕳️'
    ];

    // Subscribe to user's chats
    useEffect(() => {
        if (!account) return;

        const unsubscribe = subscribeToMyChats(account, (chatsData) => {
            setChats(chatsData);

            // Load profiles for all chat participants
            chatsData.forEach(chat => {
                const otherUser = chat.participants.find(p => p.toLowerCase() !== account.toLowerCase());
                if (otherUser && !chatProfiles[otherUser]) {
                    loadUserProfile(otherUser);
                }
            });
        });

        return () => unsubscribe();
    }, [account]);

    // Subscribe to messages in selected chat
    useEffect(() => {
        if (!selectedChat) return;

        const unsubscribe = subscribeToMessages(selectedChat.id, (messagesData) => {
            setMessages(prevMessages => {
                // Only scroll if new messages were added (not just updated)
                if (messagesData.length > prevMessages.length) {
                    setTimeout(scrollToBottom, 100);
                }
                return messagesData;
            });
        });

        return () => unsubscribe();
    }, [selectedChat]);

    // Subscribe to online status of chat participants
    useEffect(() => {
        const unsubscribers = [];

        chats.forEach(chat => {
            const otherUser = chat.participants.find(p => p.toLowerCase() !== account.toLowerCase());
            if (otherUser) {
                const unsub = subscribeToUserStatus(otherUser, (status) => {
                    setUserStatuses(prev => ({
                        ...prev,
                        [otherUser]: status
                    }));
                });
                unsubscribers.push(unsub);
            }
        });

        return () => unsubscribers.forEach(unsub => unsub());
    }, [chats, account]);

    // Close emoji picker and reaction picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if clicking on emoji picker or its trigger button
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                // Check if clicked element is the emoji picker button
                const isEmojiButton = event.target.closest('button[title="Add emoji"]');
                if (!isEmojiButton) {
                    setShowEmojiPicker(false);
                }
            }

            // Check if clicking on reaction picker or its trigger button
            if (reactionPickerRef.current && !reactionPickerRef.current.contains(event.target)) {
                // Check if clicked element is the react button
                const isReactButton = event.target.closest('button[title="React"]');
                if (!isReactButton) {
                    setShowReactionPicker(null);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadUserProfile = async (address) => {
        if (!provider) return;

        try {
            const profile = await getUserProfile(provider, address);
            setChatProfiles(prev => ({
                ...prev,
                [address]: profile
            }));
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!messageText.trim() || !selectedChat) return;

        try {
            await sendMessage(selectedChat.id, account, messageText);
            setMessageText('');
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        }
    };

    const getOtherUserAddress = (chat) => {
        return chat.participants.find(p => p.toLowerCase() !== account.toLowerCase());
    };

    const getOtherUserProfile = (chat) => {
        const otherUser = getOtherUserAddress(chat);
        return chatProfiles[otherUser];
    };

    const isUserOnline = (chat) => {
        const otherUser = getOtherUserAddress(chat);
        return userStatuses[otherUser]?.isOnline || false;
    };

    const insertEmoji = (emoji) => {
        setMessageText(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm('Delete this message?')) return;

        try {
            await deleteMessage(selectedChat.id, messageId);
        } catch (error) {
            console.error('Error deleting message:', error);
            alert('Failed to delete message.');
        }
    };

    const startEdit = (message) => {
        setEditingMessageId(message.id);
        setEditText(message.text);
    };

    const handleEditMessage = async (messageId) => {
        if (!editText.trim()) return;

        try {
            await editMessage(selectedChat.id, messageId, editText);
            setEditingMessageId(null);
            setEditText('');
        } catch (error) {
            console.error('Error editing message:', error);
            alert('Failed to edit message.');
        }
    };

    const handleAddReaction = async (messageId, emoji) => {
        try {
            const message = messages.find(m => m.id === messageId);
            if (!message) return;

            const currentReactions = message.reactions || {};

            // Check if user already reacted with this emoji
            const hasThisReaction = currentReactions[emoji]?.includes(account.toLowerCase());

            if (hasThisReaction) {
                // Remove this reaction (toggle off)
                await addReaction(selectedChat.id, messageId, account, emoji);
                setShowReactionPicker(null);
                return;
            }

            // Remove any existing reaction from this user first
            for (const [existingEmoji, users] of Object.entries(currentReactions)) {
                if (users.includes(account.toLowerCase())) {
                    // Remove previous reaction
                    await addReaction(selectedChat.id, messageId, account, existingEmoji);
                    break;
                }
            }

            // Add new reaction
            await addReaction(selectedChat.id, messageId, account, emoji);
            setShowReactionPicker(null);
        } catch (error) {
            console.error('Error adding reaction:', error);
        }
    };

    const reactionEmojis = ['❤️', '👍', '😂', '😮', '😢', '🔥', '🎉', '👏'];

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <h2 className="text-2xl font-bold mb-4">Connect Wallet to View Messages</h2>
                <p className="text-white/60">Connect your wallet to send and receive messages.</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Messages</h1>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden" style={{ height: '70vh' }}>
                <div className="flex h-full">
                    {/* Chat List - Left Panel */}
                    <div className="w-full md:w-1/3 border-r border-white/10 overflow-y-auto">
                        {chats.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">No Messages Yet</h3>
                                <p className="text-white/60 text-sm">Visit a user's profile and click "Message" to start chatting</p>
                            </div>
                        ) : (
                            chats.map((chat) => {
                                const otherUser = getOtherUserAddress(chat);
                                const profile = getOtherUserProfile(chat);
                                const isOnline = isUserOnline(chat);

                                return (
                                    <div
                                        key={chat.id}
                                        onClick={() => setSelectedChat(chat)}
                                        className={`flex items-center space-x-3 p-4 cursor-pointer transition-colors ${selectedChat?.id === chat.id
                                            ? 'bg-white/10'
                                            : 'hover:bg-white/5'
                                            }`}
                                    >
                                        <div className="relative">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden">
                                                {profile?.profileImage ? (
                                                    <img
                                                        src={getIPFSUrl(profile.profileImage)}
                                                        alt="Profile"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-black font-bold">
                                                        {(profile?.username || otherUser)?.slice(0, 2).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            {/* Online indicator */}
                                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-black ${isOnline ? 'bg-green-500' : 'bg-gray-500'
                                                }`} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold truncate">
                                                {profile ? getDisplayName(profile, otherUser) : formatAddress(otherUser)}
                                            </h3>
                                            <p className="text-sm text-white/60 truncate">
                                                {chat.lastMessage || 'No messages yet'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Messages Panel - Right Panel */}
                    <div className="hidden md:flex md:w-2/3 flex-col">
                        {selectedChat ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-white/10 flex items-center space-x-3">
                                    <div className="relative">
                                        <div
                                            className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden cursor-pointer"
                                            onClick={() => {
                                                const otherUser = getOtherUserAddress(selectedChat);
                                                navigate(`/profile/${otherUser}`);
                                            }}
                                        >
                                            {getOtherUserProfile(selectedChat)?.profileImage ? (
                                                <img
                                                    src={getIPFSUrl(getOtherUserProfile(selectedChat).profileImage)}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-black font-bold text-sm">
                                                    {(getOtherUserProfile(selectedChat)?.username || getOtherUserAddress(selectedChat))?.slice(0, 2).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-black ${isUserOnline(selectedChat) ? 'bg-green-500' : 'bg-gray-500'
                                            }`} />
                                    </div>

                                    <div>
                                        <h3 className="font-semibold">
                                            {getOtherUserProfile(selectedChat)
                                                ? getDisplayName(getOtherUserProfile(selectedChat), getOtherUserAddress(selectedChat))
                                                : formatAddress(getOtherUserAddress(selectedChat))
                                            }
                                        </h3>
                                        <p className="text-xs text-white/60">
                                            {isUserOnline(selectedChat) ? 'Online' : 'Offline'}
                                        </p>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messages.length === 0 ? (
                                        <div className="flex items-center justify-center h-full">
                                            <p className="text-white/60">No messages yet. Start the conversation!</p>
                                        </div>
                                    ) : (
                                        messages.map((message) => {
                                            const isOwn = message.sender.toLowerCase() === account.toLowerCase();
                                            const isEditing = editingMessageId === message.id;

                                            return (
                                                <div
                                                    key={message.id}
                                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
                                                    onMouseEnter={() => setHoveredMessage(message.id)}
                                                    onMouseLeave={() => setHoveredMessage(null)}
                                                >
                                                    <div className="relative max-w-xs lg:max-w-md">
                                                        {/* Message Actions */}
                                                        {hoveredMessage === message.id && (
                                                            <div className={`absolute -top-8 ${isOwn ? 'right-0' : 'left-full ml-2'} flex space-x-1 bg-gray-800 rounded-lg p-1 shadow-lg z-20`}>
                                                                {/* React Button */}
                                                                <button
                                                                    onClick={() => setShowReactionPicker(message.id)}
                                                                    className="p-2 hover:bg-white/10 rounded transition-colors"
                                                                    title="React"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                </button>
                                                                {isOwn && (
                                                                    <>
                                                                        {/* Edit Button */}
                                                                        <button
                                                                            onClick={() => startEdit(message)}
                                                                            className="p-2 hover:bg-white/10 rounded transition-colors"
                                                                            title="Edit"
                                                                        >
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                            </svg>
                                                                        </button>
                                                                        {/* Delete Button */}
                                                                        <button
                                                                            onClick={() => handleDeleteMessage(message.id)}
                                                                            className="p-2 hover:bg-white/10 rounded transition-colors text-red-400 hover:text-red-300"
                                                                            title="Delete"
                                                                        >
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                            </svg>
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Reaction Picker */}
                                                        {showReactionPicker === message.id && (
                                                            <div
                                                                ref={reactionPickerRef}
                                                                className={`absolute bg-gray-900 border border-white/20 rounded-xl p-3 shadow-2xl z-30 ${isOwn
                                                                    ? 'right-0'
                                                                    : 'left-full ml-2'
                                                                    }`}
                                                                style={{
                                                                    bottom: '100%',
                                                                    marginBottom: '8px',
                                                                    width: '280px',
                                                                    maxHeight: '240px',
                                                                    overflowY: 'auto'
                                                                }}
                                                            >
                                                                <div className="text-xs text-white/60 mb-2 font-medium">Quick Reactions</div>
                                                                <div className="grid grid-cols-8 gap-1 mb-3">
                                                                    {reactionEmojis.map((emoji) => (
                                                                        <button
                                                                            key={emoji}
                                                                            onClick={() => handleAddReaction(message.id, emoji)}
                                                                            className="text-2xl hover:bg-white/10 rounded p-1 transition-all hover:scale-110"
                                                                        >
                                                                            {emoji}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                                <div className="text-xs text-white/60 mb-2 font-medium border-t border-white/10 pt-2">All Emojis</div>
                                                                <div className="grid grid-cols-7 gap-1">
                                                                    {emojis.slice(0, 70).map((emoji, index) => (
                                                                        <button
                                                                            key={index}
                                                                            onClick={() => handleAddReaction(message.id, emoji)}
                                                                            className="text-xl hover:bg-white/10 rounded p-1 transition-all hover:scale-110"
                                                                        >
                                                                            {emoji}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Message Bubble */}
                                                        <div
                                                            className={`px-4 py-2 rounded-2xl ${isOwn
                                                                ? 'bg-white text-black'
                                                                : 'bg-white/10 text-white'
                                                                }`}
                                                        >
                                                            {isEditing ? (
                                                                <div className="flex items-center space-x-2">
                                                                    <input
                                                                        type="text"
                                                                        value={editText}
                                                                        onChange={(e) => setEditText(e.target.value)}
                                                                        className="bg-transparent border-b border-current focus:outline-none flex-1 min-w-0"
                                                                        autoFocus
                                                                        onKeyPress={(e) => {
                                                                            if (e.key === 'Enter') {
                                                                                handleEditMessage(message.id);
                                                                            }
                                                                        }}
                                                                    />
                                                                    <button
                                                                        onClick={() => handleEditMessage(message.id)}
                                                                        className="text-xs underline whitespace-nowrap"
                                                                    >
                                                                        Save
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingMessageId(null);
                                                                            setEditText('');
                                                                        }}
                                                                        className="text-xs underline whitespace-nowrap"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <p className="break-words">{message.text}</p>
                                                                    {message.edited && (
                                                                        <span className="text-xs opacity-60 italic ml-2">
                                                                            (edited)
                                                                        </span>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Reactions Display */}
                                                        {message.reactions && Object.keys(message.reactions).length > 0 && (
                                                            <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                                {Object.entries(message.reactions).map(([emoji, users]) => {
                                                                    const userReacted = users.includes(account.toLowerCase());
                                                                    const count = users.length;

                                                                    return (
                                                                        <button
                                                                            key={emoji}
                                                                            onClick={() => handleAddReaction(message.id, emoji)}
                                                                            className={`text-sm px-2 py-1 rounded-full transition-all ${userReacted
                                                                                ? 'bg-blue-500/30 border-2 border-blue-500 scale-105'
                                                                                : 'bg-white/10 hover:bg-white/20 border border-transparent'
                                                                                }`}
                                                                            title={userReacted ? 'Click to remove your reaction' : `${count} reaction${count > 1 ? 's' : ''}`}
                                                                        >
                                                                            <span className="flex items-center gap-1">
                                                                                {emoji}
                                                                                {count > 1 && <span className="text-xs">{count}</span>}
                                                                            </span>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message Input */}
                                <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10">
                                    <div className="flex space-x-2 relative">
                                        {/* Emoji Picker Button */}
                                        <button
                                            type="button"
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-colors"
                                            title="Add emoji"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </button>

                                        {/* Emoji Picker Popup */}
                                        {showEmojiPicker && (
                                            <div
                                                ref={emojiPickerRef}
                                                className="absolute bottom-full left-0 mb-2 bg-gray-900 border border-white/20 rounded-2xl p-4 shadow-2xl z-50"
                                                style={{ width: '320px', maxHeight: '300px', overflowY: 'auto' }}
                                            >
                                                <div className="grid grid-cols-8 gap-2">
                                                    {emojis.map((emoji, index) => (
                                                        <button
                                                            key={index}
                                                            type="button"
                                                            onClick={() => insertEmoji(emoji)}
                                                            className="text-2xl hover:bg-white/10 rounded p-2 transition-colors"
                                                        >
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <input
                                            type="text"
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                            placeholder="Type a message..."
                                            className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30 transition-colors"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!messageText.trim()}
                                            className="bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Send
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-10 h-10 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">Select a Chat</h3>
                                    <p className="text-white/60">Choose a conversation from the list to start messaging</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Messages;
