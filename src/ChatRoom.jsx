import React, { useContext, useEffect, useState } from 'react';
import UserContext from './UserContext';
import { db } from './firebase';
import { ref, push, onValue } from 'firebase/database';

const ChatRoom = () => {
  const { user } = useContext(UserContext);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const messagesRef = ref(db, 'messages');
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      const loadedMessages = data ? Object.entries(data).map(([id, msg]) => ({ id, ...msg })) : [];
      setMessages(loadedMessages);
    });
  }, []);

  const sendMessage = async () => {
    if (message.trim() !== '') {
      const messagesRef = ref(db, 'messages');
      await push(messagesRef, {
        text: message,
        user: user.displayName,
        email: user.email,
        uid: user.uid,
        time: new Date().toISOString()
      });
      setMessage('');
    }
  };

  return (
    <div>
      <h4>Chat Room</h4>
      <div className="mb-3">
        <input
          className="form-control"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter message..."
        />
        <button className="btn btn-success mt-2" onClick={sendMessage}>Send</button>
      </div>
      <div className="chat-box border rounded p-3" style={{ height: '300px', overflowY: 'scroll' }}>
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2">
            <strong>{msg.user || msg.email}</strong>: {msg.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatRoom;
