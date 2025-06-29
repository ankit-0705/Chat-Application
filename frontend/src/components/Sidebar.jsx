import React, { useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatContext from '../context/chatContext';

const Sidebar = ({ isMobile = false, closeDrawer }) => {
  const {
    selectedTab,
    setSelectedTab,
    setSearchModalOpen,
    unreadCounts,
    chats,
    groups,
  } = useContext(ChatContext);
  const navigate = useNavigate();

  const handleSelect = (tab) => {
    setSelectedTab(tab);
    if (isMobile && closeDrawer) closeDrawer();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    if (isMobile && closeDrawer) closeDrawer();
  };

  const unreadChatsCount = useMemo(() => {
    return chats.reduce((count, chat) => {
      if (!chat.isGroupChat && unreadCounts[chat._id]) return count + 1;
      return count;
    }, 0);
  }, [chats, unreadCounts]);

  const unreadGroupsCount = useMemo(() => {
    return groups.reduce((count, group) => {
      if (unreadCounts[group._id]) return count + 1;
      return count;
    }, 0);
  }, [groups, unreadCounts]);

  const navItemClass = (active) =>
    `p-2 rounded-lg transition-all flex items-center gap-2 ${
      active ? 'bg-[#7F2DBD]' : 'hover:bg-[#7F2DBD]/40'
    }`;

  return (
    <div
      className={`${
        isMobile ? 'absolute z-50 top-0 left-0 w-full h-full bg-[#1E1E2F] p-6' : 'h-full w-20 py-4 sticky top-0'
      } flex flex-col justify-between shadow-lg`}
    >
      {/* Top Section */}
      <div className="flex flex-col items-center space-y-6">
        {/* Profile Button */}
        <button
          onClick={() => {
            navigate('/profile');
            if (isMobile && closeDrawer) closeDrawer();
          }}
          className="focus:outline-none"
        >
          <img
            src="https://i.pravatar.cc/100"
            alt="User"
            className="w-10 h-10 rounded-full border-2 border-[#7F2DBD]"
          />
        </button>

        {/* LUMIN Logo (full name in mobile, stacked in desktop) */}
        {isMobile ? (
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent select-none text-center" style={{ backgroundImage: 'linear-gradient(135deg, #7F2DBD, #F06292)' }}>
            LUMIN
          </h1>
        ) : (
          <div className="flex flex-col items-center space-y-1 mt-4">
            {'LUMIN'.split('').map((char, index) => (
              <span
                key={index}
                className="text-transparent text-xl font-extrabold bg-clip-text select-none"
                style={{ backgroundImage: 'linear-gradient(135deg, #7F2DBD, #F06292)' }}
              >
                {char}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Nav Buttons */}
      <div className={`flex ${isMobile ? 'flex-col gap-4 mt-10' : 'flex-col items-center gap-6'} text-white`}>
        {/* Chats */}
        <button onClick={() => handleSelect('chats')} className={navItemClass(selectedTab === 'chats')}>
          💬 <span className={`${isMobile ? 'inline' : 'hidden'}`}>Chats</span>
          {unreadChatsCount > 0 && (
            <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {unreadChatsCount > 9 ? '9+' : unreadChatsCount}
            </span>
          )}
        </button>

        {/* Groups */}
        <button onClick={() => handleSelect('groups')} className={navItemClass(selectedTab === 'groups')}>
          👥 <span className={`${isMobile ? 'inline' : 'hidden'}`}>Groups</span>
          {unreadGroupsCount > 0 && (
            <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {unreadGroupsCount > 9 ? '9+' : unreadGroupsCount}
            </span>
          )}
        </button>

        {/* Search/Add */}
        <button
          onClick={() => {
            setSearchModalOpen(true);
            if (isMobile && closeDrawer) closeDrawer();
          }}
          className="hover:bg-[#7F2DBD] p-2 rounded-lg transition-all flex items-center gap-2"
        >
          🔍 <span className={`${isMobile ? 'inline' : 'hidden'}`}>Search/Add</span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="hover:bg-red-600 p-2 rounded-lg transition-all flex items-center gap-2"
        >
          🔓 <span className={`${isMobile ? 'inline' : 'hidden'}`}>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
