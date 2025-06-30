import React, { useState, useContext, useEffect } from 'react';
import ChatContext from '../context/chatContext';
import axios from 'axios';
const backendUrl = import.meta.env.VITE_API_BASE_URL;

const SearchModal = () => {
  const { isSearchModalOpen, setSearchModalOpen, fetchUser } = useContext(ChatContext);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [error, setError] = useState('');

  // Fetch incoming requests
  const fetchIncomingRequests = async () => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/user/getuser`,
        {},
        { headers: { 'auth-token': localStorage.getItem('token') } }
      );
      const requestUserIds = res.data.incomingRequests || [];

      const usersRes = await Promise.all(
        requestUserIds.map(id =>
          axios.get(`${backendUrl}/api/user/getuserbyid/${id}`, {
            headers: { 'auth-token': localStorage.getItem('token') },
          }).then(res => res.data).catch(() => null)
        )
      );

      setIncomingRequests(usersRes.filter(Boolean));
    } catch (err) {
      console.error('Failed to fetch requests', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (isSearchModalOpen) {
      fetchIncomingRequests();
    }
  }, [isSearchModalOpen]);

  // Search users
  const handleSearch = async () => {
    if (!query) return;

    setLoadingSearch(true);
    setError('');
    try {
      const res = await axios.get(`${backendUrl}/api/user/search?q=${query}`, {
        headers: { 'auth-token': localStorage.getItem('token') },
      });
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Search failed');
      setResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  // Send Request
  const sendRequest = async (userId) => {
    try {
      await axios.post(`${backendUrl}/api/user/send-request`, { userId }, {
        headers: { 'auth-token': localStorage.getItem('token') },
      });
      alert('Request sent!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send request');
    }
  };

  // Accept or Reject Request
 const respondRequest = async (userId, accept) => {
  try {
    await axios.post(`${backendUrl}/api/user/respond-request`, { userId, accept }, {
      headers: { 'auth-token': localStorage.getItem('token') },
    });

    if (accept) {
      // Create or fetch chat and send a "Hello" message
      const chatRes = await axios.post(`${backendUrl}/api/chats/access`, { userId }, {
        headers: { 'auth-token': localStorage.getItem('token') },
      });

      const chatId = chatRes.data._id;

      await axios.post(`${backendUrl}/api/message/send`, {
        content: 'Hello 👋',
        chatId,
      }, {
        headers: { 'auth-token': localStorage.getItem('token') },
      });
    }

    alert(accept ? 'Request accepted' : 'Request rejected');
    fetchIncomingRequests();
    fetchUser();
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to respond to request');
  }
};


  if (!isSearchModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-[#1E1E2F] p-6 rounded-lg w-[90%] md:w-[500px] text-white shadow-xl">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Search & Requests</h2>
          <button onClick={() => setSearchModalOpen(false)} className="text-red-400 hover:text-red-600">✖</button>
        </div>

        {/* Search Box */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            name='query'
            id='query'
            placeholder="Search by name or email..."
            className="flex-1 px-3 py-2 rounded bg-[#2E2E3E] text-white"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="bg-[#7F2DBD] px-4 py-2 rounded hover:bg-opacity-80">Search</button>
        </div>

        {/* Search Results */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Search Results:</h3>
          {loadingSearch && <p>Searching...</p>}
          {error && <p className="text-red-400">{error}</p>}
          <ul className="space-y-2 max-h-40 overflow-y-auto">
            {results.map((u) => (
              <li key={u._id} className="flex justify-between items-center bg-[#2E2E3E] p-3 rounded">
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-gray-400">{u.email}</p>
                </div>
                <button
                  onClick={() => sendRequest(u._id)}
                  className="bg-green-600 px-3 py-1 rounded hover:bg-green-700"
                >
                  Send Request
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Incoming Requests */}
        <div>
          <h3 className="font-semibold mb-2">Incoming Requests:</h3>
          {loadingRequests ? (
            <p>Loading...</p>
          ) : (
            <ul className="space-y-2 max-h-40 overflow-y-auto">
              {incomingRequests.length === 0 ? (
                <p className="text-gray-400">No requests</p>
              ) : (
                incomingRequests.map((u) => (
                  <li key={u._id} className="flex justify-between items-center bg-[#2E2E3E] p-3 rounded">
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-sm text-gray-400">{u.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => respondRequest(u._id, true)}
                        className="bg-blue-600 px-2 py-1 rounded hover:bg-blue-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => respondRequest(u._id, false)}
                        className="bg-red-600 px-2 py-1 rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
