import { useContext, useState, useEffect } from "react";
import ChatContext from "../context/chatContext";
import axios from 'axios';

const FriendItem = ({ friendId }) => {
  const { setFriends, fetchUser } = useContext(ChatContext);
  const [friend, setFriend] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user/getuserbyid/${friendId}`, {
      headers: { 'auth-token': token }
    }).then(res => {
      setFriend(res.data);
    }).catch(err => {
      console.error('Failed to fetch friend data:', err);
    }).finally(() => {
      setLoading(false);
    });
  }, [friendId]);

  const handleRemove = async () => {
  const token = localStorage.getItem('token');
  try {
    // Step 1: Remove the friend relationship
    await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/user/remove-friend/${friendId}`, {
      headers: { 'auth-token': token }
    });

    // Step 2: Remove chat and messages
    await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/chats/remove-chat/${friendId}`, {
      headers: { 'auth-token': token }
    });

    // Step 3: Update local state
    setFriends(prev => prev.filter(id => id !== friendId));
    await fetchUser();
  } catch (err) {
    console.error('Failed to remove friend and chat:', err);
  }
};


  if (loading) return <li className="text-gray-400">Loading...</li>;

  return (
    <li className="flex justify-between items-center text-white bg-[#1E1E2F] p-2 rounded">
      <span>{friend.name} ({friend.email})</span>
      <button onClick={handleRemove} className="btn btn-xs bg-[#F06292] hover:bg-[#FF7043] text-white border-none">
        Remove
      </button>
    </li>
  );
};

export default FriendItem;