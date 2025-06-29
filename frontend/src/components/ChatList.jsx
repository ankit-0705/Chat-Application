import React, { useContext, useState, useMemo, useEffect } from 'react';
import ChatContext from '../context/chatContext';
import axios from 'axios';

function ChatList() {
  const {
    selectedTab,
    friends,
    user,
    groups,
    selectedChat,
    setSelectedChat,
    unreadCounts,
    chats,
  } = useContext(ChatContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [friendData, setFriendData] = useState({});

  // Filtered Lists
  const filteredFriends = useMemo(() => {
    if (!searchTerm.trim()) return friends;
    return friends.filter((friendId) =>
      friendData[friendId]?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, friends, friendData]);

  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return groups;
    return groups.filter((group) =>
      group.chatName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, groups]);

  // Fetch friend names by ID
  const fetchFriendName = async (id) => {
    if (friendData[id]) return;

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/user/getuserbyid/${id}`, {
        headers: { 'auth-token': localStorage.getItem('token') },
      });
      const data = await res.json();
      setFriendData((prev) => ({ ...prev, [id]: data.name }));
    } catch (err) {
      console.error('Failed to fetch name:', err);
    }
  };

  useEffect(() => {
    friends.forEach(fetchFriendName);
  }, [friends]);

  // Handle friend selection
  const handleFriendSelect = async (friendId) => {
    try {
      const res = await axios.post(
        'http://127.0.0.1:5000/api/chats/access',
        { userId: friendId },
        {
          headers: { 'auth-token': localStorage.getItem('token') },
        }
      );
      setSelectedChat(res.data);
    } catch (err) {
      console.error('Failed to access or create chat:', err);
    }
  };

  // Handle group selection
  const handleGroupSelect = (group) => {
    setSelectedChat(group);
  };

  // Determine if chat is selected
  const isSelected = (chatOrFriendId) => {
    if (!selectedChat) return false;

    if (selectedTab === 'chats') {
      return selectedChat.users.some((user) => user._id === chatOrFriendId);
    } else {
      return selectedChat._id === chatOrFriendId;
    }
  };

  // Get chatId from friendId
  const getChatIdForFriend = (friendId) => {
    if (!user) return null;

    const chat = chats.find(
      (c) =>
        !c.isGroupChat &&
        c.users.length === 2 &&
        c.users.some((u) => u._id === friendId) &&
        c.users.some((u) => u._id === user._id)
    );

    return chat?._id || null;
  };

  return (
    <div className="h-full flex flex-col bg-[#1E1E2F] p-4 text-white">
      <h2 className="text-lg font-bold text-[#F06292] mb-4">
        {selectedTab === 'chats' ? 'Your Friends' : 'Your Groups'}
      </h2>

      <input
        type="text"
        placeholder={`Search ${selectedTab === 'chats' ? 'friends' : 'groups'}...`}
        className="w-full px-3 py-2 mb-4 rounded bg-[#2E2E3E] text-white border border-[#7F2DBD] focus:outline-none"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="flex-1 overflow-y-auto space-y-2">
        {selectedTab === 'chats' ? (
          filteredFriends.length === 0 ? (
            <p className="text-gray-400">No matching friends found.</p>
          ) : (
            filteredFriends.map((id) => {
              const isActive = isSelected(id);
              const chatId = getChatIdForFriend(id);
              const unread = unreadCounts[chatId] || 0;

              return (
                <div
                  key={id}
                  onClick={() => handleFriendSelect(id)}
                  className={`p-3 rounded cursor-pointer flex justify-between items-center transition ${
                    isActive ? 'bg-[#7F2DBD]' : 'bg-[#2E2E3E] hover:bg-[#38394f]'
                  }`}
                >
                  <span>{friendData[id] || 'Loading...'}</span>
                  {unread > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </div>
              );
            })
          )
        ) : filteredGroups.length === 0 ? (
          <p className="text-gray-400">No matching groups found.</p>
        ) : (
          filteredGroups.map((group) => {
            const isActive = isSelected(group._id);
            const unread = unreadCounts[group._id] || 0;

            return (
              <div
                key={group._id}
                onClick={() => handleGroupSelect(group)}
                className={`p-3 rounded cursor-pointer flex justify-between items-center transition ${
                  isActive ? 'bg-[#7F2DBD]' : 'bg-[#2E2E3E] hover:bg-[#38394f]'
                }`}
              >
                <span>{group.chatName}</span>
                {unread > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ChatList;
