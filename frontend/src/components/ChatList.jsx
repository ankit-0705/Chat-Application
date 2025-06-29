import React, { useContext, useState, useMemo, useEffect } from 'react';
import ChatContext from '../context/chatContext';
import axios from 'axios';

function ChatList() {
  const {
    selectedTab,
    friends,
    groups,
    selectedChat,
    setSelectedChat,
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

  // Handle friend selection by accessing or creating a chat
  const handleFriendSelect = async (friendId) => {
    try {
      const res = await axios.post(
        'http://127.0.0.1:5000/api/chats/access',
        { userId: friendId },
        {
          headers: { 'auth-token': localStorage.getItem('token') },
        }
      );
      setSelectedChat(res.data); // set chat object here
    } catch (err) {
      console.error('Failed to access or create chat:', err);
    }
  };

  // Handle group selection directly
  const handleGroupSelect = (group) => {
    setSelectedChat(group);
  };

  // Fix isSelected logic:
  // - For friends, selectedChat is a chat object; check if that chat is between current user and friendId.
  // - For groups, just match _id with selectedChat._id
  const isSelected = (chatOrFriendId) => {
    if (!selectedChat) return false;

    if (selectedTab === 'chats') {
      // For friends: selectedChat is a chat between current user and friend
      // So check if selectedChat.users contains chatOrFriendId
      return selectedChat.users.some(user => user._id === chatOrFriendId);
    } else {
      // For groups: chatOrFriendId is group._id
      return selectedChat._id === chatOrFriendId;
    }
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
              return (
                <div
                  key={id}
                  onClick={() => handleFriendSelect(id)}
                  className={`p-3 rounded cursor-pointer transition ${
                    isActive ? 'bg-[#7F2DBD]' : 'bg-[#2E2E3E] hover:bg-[#38394f]'
                  }`}
                >
                  {friendData[id] || 'Loading...'}
                </div>
              );
            })
          )
        ) : (
          filteredGroups.length === 0 ? (
            <p className="text-gray-400">No matching groups found.</p>
          ) : (
            filteredGroups.map((group) => {
              const isActive = isSelected(group._id);
              return (
                <div
                  key={group._id}
                  onClick={() => handleGroupSelect(group)}
                  className={`p-3 rounded cursor-pointer transition ${
                    isActive ? 'bg-[#7F2DBD]' : 'bg-[#2E2E3E] hover:bg-[#38394f]'
                  }`}
                >
                  {group.chatName}
                </div>
              );
            })
          )
        )}
      </div>
    </div>
  );
}

export default ChatList;
