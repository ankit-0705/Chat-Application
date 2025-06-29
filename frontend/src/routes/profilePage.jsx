import React, { useContext, useState } from 'react';
import ChatContext from '../context/chatContext';
import axios from 'axios';
import StatCard from '../components/StatCard';
import FriendItem from '../components/FriendItem';
import GroupItem from '../components/GroupItem';

function ProfilePage() {
  const { user, setUser, friends, groups } = useContext(ChatContext);

  const [editInfo, setEditInfo] = useState({
    name: '',
    email: '',
    pnum: '',
  });

  const handleClick = () => {
    if (!user) return;
    setEditInfo({
      name: user.name || '',
      email: user.email || '',
      pnum: user.pnum || ''
    });
    document.getElementById('my_modal_1').showModal();
  };

  const handleChange = (e) => {
    setEditInfo({ ...editInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData();

    formData.append('name', editInfo.name);
    formData.append('pnum', editInfo.pnum);

    try {
      const res = await axios.put('http://127.0.0.1:5000/api/user/update-profile', formData, {
        headers: {
          'auth-token': token,
          'Content-Type': 'multipart/form-data'
        }
      });
      setUser(res.data.user);
      document.getElementById('my_modal_1').close();
    } catch (err) {
      console.error('Profile update failed:', err);
    }
  };

  if (!user) {
    return <div className="text-white p-4">Loading profile...</div>;
  }

  return (
    <main className="flex-1 overflow-y-auto bg-[#1E1E2F]">
      <div className="flex flex-col items-center px-4 sm:px-6 lg:px-8 pt-6 max-w-5xl mx-auto">

        {/* Banner */}
        <div className="w-full relative">
          <div className="w-full h-36 sm:h-48 rounded-lg" style={{ background: 'linear-gradient(135deg, #7F2DBD, #F06292)' }}></div>

          {/* Profile Image */}
          <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2">
            <img
              src="https://i.pravatar.cc/150?img=28"
              alt="Profile"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-[#7F2DBD] shadow-lg"
            />
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-20 w-full">
          <h1 className="text-3xl font-bold text-center text-white">{user.name}</h1>

          {/* Stats Section */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mt-6 text-center">
            <StatCard label="Friends" value={user.contacts?.length || 0} />
            <StatCard label="Requests Received" value={user.incomingRequests?.length || 0} />
            <StatCard label="Requests Sent" value={user.outgoingRequests?.length || 0} />
          </div>

          {/* Edit Info Button */}
          <div className="mt-10 flex justify-between items-center">
            <h2 className="text-white text-lg font-semibold">More Info:</h2>
            <button
              onClick={handleClick}
              className="inline-flex items-center gap-2 text-[#F06292] hover:text-[#FF7043] transition text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6 3 3-6 6H9v-3z" />
              </svg>
              Edit
            </button>

            {/* Modal */}
            <dialog id="my_modal_1" className="modal">
              <div className="modal-box bg-[#252636] text-white w-full max-w-md p-6">
                <h3 className="font-bold text-lg text-center text-[#F06292] mb-4">Edit Profile Info</h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <input
                    type="text"
                    name="name"
                    value={editInfo.name}
                    onChange={handleChange}
                    required
                    placeholder="Username"
                    className="input input-bordered w-full bg-[#1E1E2F] border-[#7F2DBD] text-white"
                  />
                  <input
                    type="email"
                    name="email"
                    value={editInfo.email}
                    disabled
                    className="input input-bordered w-full bg-[#1E1E2F] border-[#7F2DBD] text-white cursor-not-allowed"
                  />
                  <input
                    type="tel"
                    name="pnum"
                    value={editInfo.pnum}
                    onChange={handleChange}
                    required
                    placeholder="Phone"
                    className="input input-bordered w-full bg-[#1E1E2F] border-[#7F2DBD] text-white"
                  />
                  <div className="modal-action flex justify-between">
                    <button type="submit" className="btn bg-[#F06292] border-none text-white hover:bg-[#FF7043]">Save</button>
                    <button type="button" className="btn bg-[#33354A] border-none text-white hover:bg-[#7F2DBD]" onClick={() => document.getElementById('my_modal_1').close()}>Cancel</button>
                  </div>
                </form>
              </div>
            </dialog>
          </div>

          {/* More Info Collapsible */}
          <div className="mt-4 collapse bg-[#252636] border border-[#7F2DBD] rounded">
            <input type="checkbox" />
            <div className="collapse-title font-semibold text-white text-base">Click to view more info</div>
            <div className="collapse-content text-white flex flex-col gap-4">
              <p><span className="font-medium">Email:</span> <span className="text-[#B0B0B0]">{user.email}</span></p>
              <p><span className="font-medium">Phone Number:</span> <span className="text-[#B0B0B0]">{user.pnum}</span></p>
            </div>
          </div>

          {/* Friends List Section */}
          <div className="mt-6 bg-[#252636] border border-[#7F2DBD] rounded p-4">
            <h3 className="text-white font-semibold text-lg mb-4">Your Friends</h3>
            {friends.length === 0 ? (
              <p className="text-gray-400">You have no friends added yet.</p>
            ) : (
              <ul className="flex flex-col gap-2 max-h-[300px] overflow-auto">
                {friends.map(friendId => (
                  <FriendItem key={friendId} friendId={friendId} />
                ))}
              </ul>
            )}
          </div>

          {/* Group Membership Section */}
          <div className="mt-6 bg-[#252636] border border-[#7F2DBD] rounded p-4 mb-10">
            <h3 className="text-white font-semibold text-lg mb-4">Your Groups</h3>
            {groups.length === 0 ? (
              <p className="text-gray-400">You're not part of any groups.</p>
            ) : (
              <ul className="flex flex-col gap-2 max-h-[300px] overflow-auto">
                {groups.map(group => (
                  <GroupItem key={group._id} group={group} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default ProfilePage;
