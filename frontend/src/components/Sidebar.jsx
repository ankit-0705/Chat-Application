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

  // Count unread messages for friends and groups
  const unreadChatsCount = useMemo(() => {
    return chats.reduce((count, chat) => {
      if (!chat.isGroupChat && unreadCounts[chat._id]) {
        return count + 1;
      }
      return count;
    }, 0);
  }, [chats, unreadCounts]);

  const unreadGroupsCount = useMemo(() => {
    return groups.reduce((count, group) => {
      if (unreadCounts[group._id]) {
        return count + 1;
      }
      return count;
    }, 0);
  }, [groups, unreadCounts]);

  return (
    <div className="h-full w-20 bg-[#1E1E2F] flex flex-col items-center justify-between py-4 shadow-lg sticky top-0 md:h-screen">
      
      {/* Profile */}
      <div className="flex flex-col items-center">
        <div className="tooltip tooltip-right" data-tip="Your Profile">
          <button onClick={() => {
            navigate('/profile');
            if (isMobile && closeDrawer) closeDrawer();
          }}>
            <img
              src="https://i.pravatar.cc/100"
              alt="User"
              className="w-10 h-10 rounded-full border-2 border-[#7F2DBD] mt-2"
            />
          </button>
        </div>
      </div>

      {/* LUMIN Logo */}
      <div className="flex flex-col items-center space-y-3 mt-6">
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

      {/* Options */}
      <div className="flex flex-col items-center gap-6 text-white mb-4 relative">
        {/* Chats Button */}
        <div className="tooltip tooltip-right" data-tip="Chats">
          <div className="relative">
            <button
              onClick={() => handleSelect('chats')}
              className={`p-2 rounded-lg transition-all ${
                selectedTab === 'chats' ? 'bg-[#7F2DBD]' : 'hover:bg-[#7F2DBD]/40'
              }`}
            >
              💬
            </button>
            {unreadChatsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {unreadChatsCount > 9 ? '9+' : unreadChatsCount}
              </span>
            )}
          </div>
        </div>

        {/* Groups Button */}
        <div className="tooltip tooltip-right" data-tip="Groups">
          <div className="relative">
            <button
              onClick={() => handleSelect('groups')}
              className={`p-2 rounded-lg transition-all ${
                selectedTab === 'groups' ? 'bg-[#7F2DBD]' : 'hover:bg-[#7F2DBD]/40'
              }`}
            >
              👥
            </button>
            {unreadGroupsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {unreadGroupsCount > 9 ? '9+' : unreadGroupsCount}
              </span>
            )}
          </div>
        </div>

        {/* Search Button */}
        <div className="tooltip tooltip-right" data-tip="Search/Add">
          <button
            onClick={() => {
              setSearchModalOpen(true);
              if (isMobile && closeDrawer) closeDrawer();
            }}
            className="hover:bg-[#7F2DBD] p-2 rounded-lg transition-all"
          >
            🔍
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
