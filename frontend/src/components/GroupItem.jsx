import React, { useContext } from 'react';
import axios from 'axios';
import ChatContext from '../context/chatContext';

const GroupItem = ({ group }) => {
  const { fetchGroups } = useContext(ChatContext);

  const handleLeaveGroup = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/chats/leave-group/${group._id}`, {}, {
        headers: { 'auth-token': token }
      });

      fetchGroups(); // Refresh groups after leaving
    } catch (err) {
      console.error('Failed to leave group:', err);
    }
  };

  return (
    <li className="flex justify-between items-center text-white bg-[#1E1E2F] p-2 rounded">
      <span>{group.chatName}</span>
      <button onClick={handleLeaveGroup} className="btn btn-xs bg-red-500 hover:bg-red-600 text-white border-none">
        Leave
      </button>
    </li>
  );
};

export default GroupItem;
