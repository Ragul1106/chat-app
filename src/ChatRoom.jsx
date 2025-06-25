import React, { useContext, useEffect, useRef, useState } from 'react';
import UserContext from './UserContext';
import { db } from './firebase';
import { ref, push, onValue, remove, set, onDisconnect } from 'firebase/database';
import { formatDistanceToNow } from 'date-fns';
import EmojiPicker from 'emoji-picker-react';
import { getAuth, signOut } from 'firebase/auth';
import { FiSend, FiSmile, FiTrash2, FiLogOut, FiUser } from 'react-icons/fi';
import { IoMdNotifications } from 'react-icons/io';
import { BsThreeDotsVertical } from 'react-icons/bs';

const ChatRoom = () => {
    const { user } = useContext(UserContext);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [typingUsers, setTypingUsers] = useState({});
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showOnlineUsers, setShowOnlineUsers] = useState(false);

    const chatEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const messagesRef = ref(db, 'messages');
        onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            const loaded = data
                ? Object.entries(data).map(([id, msg]) => ({ id, ...msg }))
                : [];
            setMessages(loaded);
        });
    }, []);

    useEffect(() => {
        const userStatusRef = ref(db, `presence/${user.uid}`);
        set(userStatusRef, {
            name: user.displayName || user.email,
            photoURL: user.photoURL || null,
            lastSeen: new Date().toISOString()
        });
        onDisconnect(userStatusRef).remove();

        const presenceRef = ref(db, 'presence');
        onValue(presenceRef, (snapshot) => {
            const data = snapshot.val() || {};
            setOnlineUsers(Object.values(data));
        });
    }, [user]);

    useEffect(() => {
        const typingRef = ref(db, 'typing');
        onValue(typingRef, (snapshot) => {
            const data = snapshot.val() || {};
            setTypingUsers(data);
        });
    }, []);

    const handleTyping = (e) => {
        const input = e.target.value;
        setMessage(input);
        const typingRef = ref(db, `typing/${user.uid}`);
        if (input.trim()) {
            set(typingRef, {
                name: user.displayName || user.email,
                uid: user.uid
            });
        } else {
            remove(typingRef);
        }
    };

    const sendMessage = async () => {
        if (message.trim() === '') return;
        const messagesRef = ref(db, 'messages');
        await push(messagesRef, {
            text: message,
            user: user.displayName,
            email: user.email,
            uid: user.uid,
            photoURL: user.photoURL || null,
            time: new Date().toISOString(),
        });
        setMessage('');
        remove(ref(db, `typing/${user.uid}`));
        inputRef.current.focus();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = async () => {
        if (window.confirm('Are you sure you want to clear all chat messages? This action cannot be undone.')) {
            await remove(ref(db, 'messages'));
        }
    };

    const getUserInitials = (name = '', email = '') => {
        return (name || email).charAt(0).toUpperCase();
    };

    const toggleEmojiPicker = () => {
        setShowEmojiPicker((prev) => !prev);
    };

    const handleEmojiClick = (emojiData) => {
        setMessage((prev) => prev + emojiData.emoji);
        inputRef.current.focus();
    };

    const signOutUser = () => {
        const auth = getAuth();
        signOut(auth);
    };

    const getActiveTypers = () => {
        return Object.entries(typingUsers)
            .filter(([uid]) => uid !== user.uid)
            .map(([_, userData]) => userData.name);
    };

    return (
        <div className="chat-app-container">
            <div className="chat-header fixed-top shadow-sm p-3" >
                <div className="container-fluid">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                            <div className="chat-title">
                                <h3 className="mb-0 fw-bold">Chat Room</h3>
                                <span className="badge bg-primary ms-2">{onlineUsers.length} online</span>
                            </div>
                        </div>

                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center"
                                onClick={() => setShowOnlineUsers(!showOnlineUsers)}
                                title="Online users"
                                aria-label="Toggle online users"
                                style={{ width: '36px', height: '36px' }}
                            >
                                <IoMdNotifications size={18} />
                            </button>

                            <div className="dropdown">
                                <button
                                    className="btn  btn-sm rounded-circle d-flex align-items-center justify-content-center"
                                    type="button"
                                    id="chatDropdownMenu"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    aria-label="Chat menu options"
                                    style={{ width: '36px', height: '36px' }}
                                >
                                    <BsThreeDotsVertical size={18} />
                                </button>

                                <ul
                                    className="dropdown-menu dropdown-menu-end shadow"
                                    aria-labelledby="chatDropdownMenu"
                                >
                                    <li>
                                        <button
                                            className="dropdown-item d-flex align-items-center"
                                            onClick={clearChat}
                                        >
                                            <FiTrash2 className="me-2 text-danger" />
                                            <span>Clear Chat</span>
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className="dropdown-item d-flex align-items-center"
                                            onClick={signOutUser}
                                        >
                                            <FiLogOut className="me-2" />
                                            <span>Sign Out</span>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showOnlineUsers && (
                <div className="online-users-sidebar">
                    <div className="sidebar-header">
                        <h5>Online Users</h5>
                        <button
                            className="btn btn-close"
                            onClick={() => setShowOnlineUsers(false)}
                        />
                    </div>
                    <div className="user-list">
                        {onlineUsers.map((user, i) => (
                            <div key={i} className="user-item">
                                {user.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt={user.name}
                                        className="user-avatar"
                                    />
                                ) : (
                                    <div className="avatar-placeholder">
                                        {getUserInitials(user.name, user.email)}
                                    </div>
                                )}
                                <span className="user-name">{user.name || user.email}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="chat-messages">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`message ${msg.uid === user.uid ? 'sent' : 'received'}`}
                    >
                        {msg.uid !== user.uid && (
                            <div className="message-sender">
                                {msg.photoURL ? (
                                    <img
                                        src={msg.photoURL}
                                        alt={msg.user}
                                        className="user-avatar"
                                    />
                                ) : (
                                    <div className="avatar-placeholder">
                                        {getUserInitials(msg.user, msg.email)}
                                    </div>
                                )}
                                <span className="sender-name">{msg.user || msg.email}</span>
                            </div>
                        )}
                        <div className="message-content">
                            <div className="message-text">{msg.text}</div>
                            <div className="message-time">
                                {msg.time ? formatDistanceToNow(new Date(msg.time), {
                                    addSuffix: true
                                }) : ''}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            <div className="typing-indicator">
                {getActiveTypers().length > 0 && (
                    <div className="typing-text">
                        {getActiveTypers().join(', ')} {getActiveTypers().length > 1 ? 'are' : 'is'} typing...
                    </div>
                )}
            </div>

            <div className="message-input-container">
                <div className="emoji-picker-container">
                    {showEmojiPicker && (
                        <div className="emoji-picker">
                            <EmojiPicker
                                onEmojiClick={handleEmojiClick}
                                width="100%"
                                height={300}
                            />
                        </div>
                    )}
                </div>
                <div className="input-group">
                    <button
                        className="btn btn-emoji"
                        onClick={toggleEmojiPicker}
                        title="Emoji"
                    >
                        <FiSmile size={20} />
                    </button>
                    <textarea
                        ref={inputRef}
                        className="form-control message-input"
                        rows={1}
                        placeholder="Type a message..."
                        value={message}
                        onChange={handleTyping}
                        onKeyDown={handleKeyPress}
                        autoFocus
                    />
                    <button
                        className="btn btn-send"
                        onClick={sendMessage}
                        disabled={!message.trim()}
                        title="Send"
                    >
                        <FiSend size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatRoom;