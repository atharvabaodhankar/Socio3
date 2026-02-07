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
    addReaction,
    createOrGetChat
} from '../services/firebaseService';
import { getUserProfile, getDisplayName } from '../services/profileService';
import { getIPFSUrl } from '../config/pinata';
import NewChatModal from '../components/NewChatModal';

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
    const [searchTerm, setSearchTerm] = useState('');
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
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

    const handleNewChatSelect = async (address) => {
        try {
            const chatId = await createOrGetChat(account, address);
            // The subscription to chats will pick this up, but we can proactively 
            // set selection or wait for chats update
            setIsNewChatModalOpen(false);
            
            // Find the chat if it already exists or wait for it to be added by subscription
            const existingChat = chats.find(c => c.id === chatId);
            if (existingChat) {
                setSelectedChat(existingChat);
            } else {
                // If it's brand new, it will appear in chats list soon
                // We'll let the user select it from the list once it appears
                // or we can pollyfill the selectedChat state
                setSelectedChat({
                    id: chatId,
                    participants: [account.toLowerCase(), address.toLowerCase()],
                    lastMessage: null,
                    lastMessageTime: new Date()
                });
            }
        } catch (error) {
            console.error('Error starting new chat:', error);
        }
    };

    const filteredChats = chats.filter(chat => {
        const otherUser = getOtherUserAddress(chat);
        const profile = getOtherUserProfile(chat);
        const name = profile ? getDisplayName(profile, otherUser) : formatAddress(otherUser);
        return name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               otherUser.toLowerCase().includes(searchTerm.toLowerCase());
    });

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
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Messages</h1>
                <button 
                    onClick={() => setIsNewChatModalOpen(true)}
                    className="md:hidden bg-white text-black p-2 rounded-full hover:bg-white/90 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm" style={{ height: '75vh' }}>
                <div className="flex h-full">
                    {/* Chat List - Left Panel */}
                    <div className={`w-full md:w-[350px] border-r border-white/10 flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
                        {/* Chat List Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <h2 className="text-xl font-bold truncate pr-2">{formatAddress(account)}</h2>
                            <button 
                                onClick={() => setIsNewChatModalOpen(true)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                                title="New Message"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                        </div>

                        {/* Chat Search */}
                        <div className="p-4">
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search chats..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-white/20 transition-colors"
                                />
                            </div>
                        </div>

                        {/* List Items */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {chats.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                    <h3 className="text-lg font-semibold mb-2">No Messages Yet</h3>
                                    <p className="text-white/60 text-sm mb-6">Send private photos and messages to a friend.</p>
                                    <button 
                                        onClick={() => setIsNewChatModalOpen(true)}
                                        className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Send message
                                    </button>
                                </div>
                            ) : filteredChats.length === 0 ? (
                                <div className="p-8 text-center text-white/40">
                                    No chats match your search.
                                </div>
                            ) : (
                                filteredChats.map((chat) => {
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
                                                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {profile?.profileImage ? (
                                                        <img
                                                            src={getIPFSUrl(profile.profileImage)}
                                                            alt="Profile"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-black font-bold text-lg">
                                                            {(profile?.username || otherUser)?.slice(0, 2).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-black ${isOnline ? 'bg-green-500' : 'bg-gray-500'
                                                    }`} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold truncate text-white">
                                                    {profile ? getDisplayName(profile, otherUser) : formatAddress(otherUser)}
                                                </h3>
                                                <p className={`text-sm truncate ${chat.lastMessage ? 'text-white/60' : 'text-blue-400 font-medium'}`}>
                                                    {chat.lastMessage || 'New conversation'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Messages Panel - Right Panel */}
                    <div className={`${selectedChat ? 'flex' : 'hidden'} md:flex md:flex-1 flex-col w-full bg-black/20`}>
                        {selectedChat ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <button 
                                            onClick={() => setSelectedChat(null)}
                                            className="md:hidden p-2 -ml-2 text-white/60 hover:text-white rounded-full"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
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
                                            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-black ${isUserOnline(selectedChat) ? 'bg-green-500' : 'bg-gray-500'}`} />
                                        </div>

                                        <div>
                                            <h3 className="font-semibold text-white">
                                                {getOtherUserProfile(selectedChat)
                                                    ? getDisplayName(getOtherUserProfile(selectedChat), getOtherUserAddress(selectedChat))
                                                    : formatAddress(getOtherUserAddress(selectedChat))
                                                }
                                            </h3>
                                            <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">
                                                {isUserOnline(selectedChat) ? 'Active Now' : 'Offline'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button className="p-2 text-white/60 hover:text-white rounded-full transition-colors">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </button>
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
                                    <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-2">Your Messages</h3>
                                    <p className="text-white/40 mb-8 max-w-[280px] mx-auto">Send private photos and messages to a friend or group.</p>
                                    <button 
                                        onClick={() => setIsNewChatModalOpen(true)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95"
                                    >
                                        Send message
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal for new chat */}
            <NewChatModal 
                isOpen={isNewChatModalOpen}
                onClose={() => setIsNewChatModalOpen(false)}
                onSelect={handleNewChatSelect}
            />
        </div>
    );
};

export default Messages;
