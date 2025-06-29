import ChatContext from './chatContext';
import { useState, useEffect } from 'react';
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
      headers: { 'auth-token': token }
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
  if (user) {
    fetchGroups();

    const handleMessage = (newMessage) => {
      setChats((prevChats) => {
        const chatIndex = prevChats.findIndex(chat => chat._id === newMessage.chat._id);
        if (chatIndex === -1) return prevChats;

        const updatedChat = {
          ...prevChats[chatIndex],
          latestMessage: newMessage,
        };

        const updatedChats = [...prevChats];
        updatedChats.splice(chatIndex, 1);
        updatedChats.unshift(updatedChat);

        return updatedChats;
      });
    };

    socket.on('connected',()=>{
      console.log('Socket connected in ChatState');
      fetchChats();
    })

    socket.on("message received", handleMessage);

    return () => {
      socket.off("message received", handleMessage);
      socket.off('connected'); // ✅ CLEAN UP
    };
  }
}, [user]);


  return (
    <ChatContext.Provider value={{ user, setUser, loading, chats, fetchChats, chatLoading, selectedTab, setSelectedTab, isSearchModalOpen, setSearchModalOpen, friends, setFriends,selectedChat, setSelectedChat,groups, setGroups, fetchGroups, clearSelectedChat }}>
      {!loading ? props.children : <div className="text-white p-4">Loading...</div>}
    </ChatContext.Provider>
  );
};

export default ChatState;