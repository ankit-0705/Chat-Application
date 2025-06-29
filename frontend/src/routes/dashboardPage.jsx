import React from 'react';
import Sidebar from '../components/Sidebar';
import ChatList from '../components/ChatList';
import ChatBox from '../components/ChatBox';
import SearchModal from '../components/SearchModal'; // ⬅️ Import your modal

function DashboardPage() {
  return (
    <div className="flex h-screen bg-[#1a1b2f] text-white overflow-hidden relative">
      {/* Sidebar */}
      <Sidebar />

      {/* Chat List */}
      <div className="w-[400px] border-r border-gray-700 overflow-y-auto">
        <ChatList />
      </div>

      {/* Chat Box */}
      <div className="flex-1 overflow-hidden">
        <ChatBox />
      </div>

      {/* Search/Add Modal */}
      <SearchModal />
    </div>
  );
}

export default DashboardPage;