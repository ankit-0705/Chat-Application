import React, { useContext, useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatList from '../components/ChatList';
import ChatBox from '../components/ChatBox';
import SearchModal from '../components/SearchModal';
import ChatContext from '../context/chatContext';
import { useNavigate } from 'react-router-dom';

import img1 from '../assets/Profile Pics/1.jpg';
import img2 from '../assets/Profile Pics/2.jpg';
import img3 from '../assets/Profile Pics/3.jpg';
import img4 from '../assets/Profile Pics/4.jpg';
import img5 from '../assets/Profile Pics/5.jpg';
import img6 from '../assets/Profile Pics/6.jpg';
import img7 from '../assets/Profile Pics/7.jpg';
import img8 from '../assets/Profile Pics/8.jpg';
import img9 from '../assets/Profile Pics/9.jpg';
import img10 from '../assets/Profile Pics/10.jpg';
import img11 from '../assets/Profile Pics/11.jpg';
import img12 from '../assets/Profile Pics/12.jpg';
import img13 from '../assets/Profile Pics/13.jpg';
import img14 from '../assets/Profile Pics/14.jpg';
import img15 from '../assets/Profile Pics/15.jpg';
import img16 from '../assets/Profile Pics/16.jpg';
import img17 from '../assets/Profile Pics/17.jpg';
import img18 from '../assets/Profile Pics/18.jpg';
import img19 from '../assets/Profile Pics/19.jpg';
import img20 from '../assets/Profile Pics/20.jpg';
import img21 from '../assets/Profile Pics/21.jpg';
import img22 from '../assets/Profile Pics/22.jpg';
import img23 from '../assets/Profile Pics/23.jpg';
import img24 from '../assets/Profile Pics/24.jpg';

const profileImages = [
  img1,img2,img3,img4,img5,img6,
  img7,img8,img9,img10,img11,img12,
  img13,img14,img15,img16,img17,img18,
  img19,img20,img21,img22,img23,img24]

function DashboardPage() {
  const {
    selectedChat,
    setSelectedTab,
    setSearchModalOpen,
    unreadCounts,
    chats,
  } = useContext(ChatContext);

  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [profilePic, setProfilePic] = useState(null);
  
    useEffect(()=>{
      const randomIndex = Math.floor(Math.random()*profileImages.length);
      setProfilePic(profileImages[randomIndex]);
    },[]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // --- UNREAD COUNTS FOR MOBILE BOTTOM NAV ---
  const privateUnread = chats
    .filter(c => !c.isGroupChat)
    .reduce((sum, chat) => sum + (unreadCounts[chat._id] || 0), 0);

  const groupUnread = chats
    .filter(c => c.isGroupChat)
    .reduce((sum, chat) => sum + (unreadCounts[chat._id] || 0), 0);

  return (
    <div className="flex flex-col h-screen bg-[#1a1b2f] text-white overflow-hidden relative">

      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <h1
          className="text-lg font-bold bg-clip-text text-transparent select-none"
          style={{ backgroundImage: 'linear-gradient(135deg, #7F2DBD, #F06292)' }}
        >
          LUMIN
        </h1>

        <button
          onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-full border-2 border-[#7F2DBD]"
          title="Your Profile"
        >
          <img
            src={profilePic}
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

        {isMobile ? (
          !selectedChat ? (
            <div className="w-full overflow-y-auto">
              <ChatList />
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <ChatBox />
            </div>
          )
        ) : (
          <>
            <div className="w-full md:w-[400px] border-r border-gray-700 overflow-y-auto">
              <ChatList />
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatBox />
            </div>
          </>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden flex justify-around items-center bg-[#1E1E2F] border-t border-gray-700 py-2 text-xl">

        {/* 💬 Chats */}
        <div className="relative tooltip tooltip-top" data-tip="Chats">
          <button
            onClick={() => setSelectedTab('chats')}
            className="p-2 rounded-full transition-colors hover:bg-[#7F2DBD]/50 relative"
          >
            💬
            {privateUnread > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {privateUnread > 9 ? '9+' : privateUnread}
              </span>
            )}
          </button>
        </div>

        {/* 👥 Groups */}
        <div className="relative tooltip tooltip-top" data-tip="Groups">
          <button
            onClick={() => setSelectedTab('groups')}
            className="p-2 rounded-full transition-colors hover:bg-[#7F2DBD]/50 relative"
          >
            👥
            {groupUnread > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {groupUnread > 9 ? '9+' : groupUnread}
              </span>
            )}
          </button>
        </div>

        {/* 🔍 Search/Add */}
        <div className="tooltip tooltip-top" data-tip="Search/Add">
          <button
            onClick={() => setSearchModalOpen(true)}
            className="p-2 rounded-full transition-colors hover:bg-[#7F2DBD]/50"
          >
            🔍
          </button>
        </div>

        {/* 🔓 Logout */}
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
