import React, { useContext } from 'react';
import Sidebar from '../components/Sidebar';
import ChatList from '../components/ChatList';
import ChatBox from '../components/ChatBox';
import SearchModal from '../components/SearchModal';
import ChatContext from '../context/chatContext';
import { useNavigate } from 'react-router-dom';

function DashboardPage() {
  const {
    setSelectedTab,
    setSearchModalOpen,
  } = useContext(ChatContext);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="flex flex-col h-screen bg-[#1a1b2f] text-white overflow-hidden relative">

      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-700">
        {/* LUMIN Logo */}
        <h1
          className="text-lg font-bold bg-clip-text text-transparent select-none"
          style={{ backgroundImage: 'linear-gradient(135deg, #7F2DBD, #F06292)' }}
        >
          LUMIN
        </h1>

        {/* Profile Avatar */}
        <button
          onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-full border-2 border-[#7F2DBD]"
          title="Your Profile"
        >
          <img
            src="https://i.pravatar.cc/100"
            alt="User"
            className="w-full h-full rounded-full object-cover"
          />
        </button>
      </div>

      {/* Main Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for desktop only */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Chat List */}
        <div className="w-full md:w-[400px] border-r border-gray-700 overflow-y-auto">
          <ChatList />
        </div>

        {/* Chat Box */}
        <div className="flex-1 overflow-hidden">
          <ChatBox />
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden flex justify-around items-center bg-[#1E1E2F] border-t border-gray-700 py-2 text-xl">
        {/* Chats */}
        <div className="tooltip tooltip-top" data-tip="Chats">
          <button
            onClick={() => setSelectedTab('chats')}
            className="p-2 rounded-full transition-colors hover:bg-[#7F2DBD]/50"
          >
            💬
          </button>
        </div>

        {/* Groups */}
        <div className="tooltip tooltip-top" data-tip="Groups">
          <button
            onClick={() => setSelectedTab('groups')}
            className="p-2 rounded-full transition-colors hover:bg-[#7F2DBD]/50"
          >
            👥
          </button>
        </div>

        {/* Search/Add */}
        <div className="tooltip tooltip-top" data-tip="Search/Add">
          <button
            onClick={() => setSearchModalOpen(true)}
            className="p-2 rounded-full transition-colors hover:bg-[#7F2DBD]/50"
          >
            🔍
          </button>
        </div>

        {/* Logout */}
        <div className="tooltip tooltip-top" data-tip="Logout">
          <button
            onClick={handleLogout}
            className="p-2 rounded-full transition-colors hover:bg-red-600"
          >
            🔓
          </button>
        </div>
      </div>

      <SearchModal />
    </div>
  );
}

export default DashboardPage;
