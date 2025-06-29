import React, { useContext, useEffect, useRef, useState } from 'react';
import ChatContext from '../context/chatContext';
import axios from 'axios';
import socket from '../utils/socket';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

const ChatBox = () => {
  const { selectedChat, user, setSelectedChat } = useContext(ChatContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  useEffect(() => {
    if (!selectedChat?._id) return;
    fetchMessages();
    socket.emit('join chat', selectedChat._id);
  }, [selectedChat]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://127.0.0.1:5000/api/message/fetch', {
        headers: { 'auth-token': token },
        params: { chatId: selectedChat._id },
      });
      setMessages(res.data);
      scrollToBottom();
    } catch (err) {
      console.error('Failed to load messages:', err.response || err);
    }
  };

  useEffect(() => {
    const messageHandler = (data) => {
      const actualMessage = data.message || data;
      if (selectedChat && actualMessage.chat === selectedChat._id) {
        setMessages((prev) => [...prev, actualMessage]);
        scrollToBottom();
      }
    };

    const handleTyping = () => setIsTyping(true);
    const handleStopTyping = () => setIsTyping(false);

    socket.on('message received', messageHandler);
    socket.on('typing', handleTyping);
    socket.on('stop typing', handleStopTyping);

    return () => {
      socket.off('message received', messageHandler);
      socket.off('typing', handleTyping);
      socket.off('stop typing', handleStopTyping);
    };
  }, [selectedChat]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://127.0.0.1:5000/api/message/send',
        {
          content: newMessage,
          chatId: selectedChat._id,
        },
        {
          headers: { 'auth-token': token },
        }
      );

      const actualMessage = res.data.message || res.data;
      setMessages((prev) => [...prev, actualMessage]);
      socket.emit('new message', { message: actualMessage, chat: selectedChat });
      setNewMessage('');
      scrollToBottom();
    } catch (err) {
      console.error('Message send failed:', err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTyping = () => {
    if (!socket || !selectedChat) return;

    socket.emit('typing', selectedChat._id);
    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      socket.emit('stop typing', selectedChat._id);
    }, 3000);

    setTypingTimeout(timeout);
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
  };

  if (!selectedChat) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-center px-4">
        Select a chat to start messaging.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#1A1B2F]">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-700 text-white font-semibold flex justify-between items-center text-base sm:text-lg">
        <div className="truncate">
          {selectedChat.isGroupChat
            ? selectedChat.chatName
            : selectedChat.users?.find((u) => u._id !== user._id)?.name}
        </div>
        <button
          onClick={handleCloseChat}
          className="text-gray-400 hover:text-white text-2xl sm:text-xl font-bold"
          aria-label="Close Chat"
          title="Close Chat"
        >
          ×
        </button>
      </div>

      {/* Messages Section */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        {messages.length === 0 ? (
          <p className="text-gray-400">No messages yet.</p>
        ) : (
          messages.map((msg, index) => (
            <MessageBubble
              key={msg._id || `${msg.content}-${index}`}
              message={msg}
              isOwnMessage={msg.sender?._id === user._id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {isTyping && (
        <div className="text-gray-400 text-xs sm:text-sm ml-4 mb-1">
          {selectedChat.isGroupChat
            ? 'Someone is typing...'
            : `${selectedChat.users.find((u) => u._id !== user._id)?.name || 'User'} is typing...`}
        </div>
      )}

      {/* Message Input */}
      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        sendMessage={sendMessage}
        handleKeyDown={handleKeyDown}
        handleTyping={handleTyping}
      />
    </div>
  );
};

export default ChatBox;
