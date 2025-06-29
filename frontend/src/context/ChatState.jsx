import ChatContext from './chatContext';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import socket from '../utils/socket';

const ChatState = (props) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('chats');
  const [isSearchModalOpen, setSearchModalOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});

  // Ref to track latest selectedChat value
  const selectedChatRef = useRef(null);
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  const clearSelectedChat = () => setSelectedChat(null);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await axios.post(
        'http://127.0.0.1:5000/api/user/getuser',
        {},
        { headers: { 'auth-token': token } }
      );
      setUser(res.data);
      setFriends(res.data.contacts || []);
    } catch (err) {
      localStorage.removeItem('token');
    }
  };

  const fetchChats = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setChatLoading(true);
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/chats/fetch', {
        headers: { 'auth-token': token },
      });
      setChats(res.data);
    } catch (err) {
      console.error('Error fetching chats:', err);
    } finally {
      setChatLoading(false);
    }
  };

  const fetchGroups = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await axios.get('http://127.0.0.1:5000/api/chats/my-groups', {
        headers: { 'auth-token': token },
      });
      setGroups(res.data);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    }
  };

  useEffect(() => {
    fetchUser().finally(() => setLoading(false));
  }, []);

 useEffect(() => {
  if (!user) return;

  socket.emit("setup", user); // Ensure user joins socket

  const handleMessage = (newMessage) => {
    const chatId = newMessage.chat._id;

    setChats((prevChats) => {
      const chatIndex = prevChats.findIndex(chat => chat._id === chatId);
      let updatedChats = [...prevChats];
      if (chatIndex !== -1) {
        const updatedChat = { ...prevChats[chatIndex], latestMessage: newMessage };
        updatedChats.splice(chatIndex, 1);
        updatedChats.unshift(updatedChat);
      } else {
        updatedChats.unshift(newMessage.chat);
      }
      return updatedChats;
    });

    setUnreadCounts((prev) => {
      if (selectedChatRef.current && selectedChatRef.current._id === chatId) {
        return { ...prev, [chatId]: 0 };
      }
      return {
        ...prev,
        [chatId]: (prev[chatId] || 0) + 1,
      };
    });
  };

  socket.on('connected', () => console.log('Socket connected'));
  socket.on('message received', handleMessage);

  fetchChats();
  fetchGroups();

  return () => {
    socket.off('message received', handleMessage);
    socket.off('connected');
  };
}, [user]);



  // Reset unread count when selected chat changes
  useEffect(() => {
    if (selectedChat) {
      setUnreadCounts((prev) => ({
        ...prev,
        [selectedChat._id]: 0,
      }));
    }
  }, [selectedChat]);

  return (
    <ChatContext.Provider
      value={{
        user,
        setUser,
        fetchUser,
        loading,
        chats,
        fetchChats,
        chatLoading,
        selectedTab,
        setSelectedTab,
        isSearchModalOpen,
        setSearchModalOpen,
        friends,
        setFriends,
        selectedChat,
        setSelectedChat,
        groups,
        setGroups,
        fetchGroups,
        clearSelectedChat,
        unreadCounts,
        setUnreadCounts,
      }}
    >
      {!loading ? props.children : <div className="text-white p-4">Loading...</div>}
    </ChatContext.Provider>
  );
};

export default ChatState;
