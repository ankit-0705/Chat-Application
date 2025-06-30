import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/Logo.jpg'
const backendUrl = import.meta.env.VITE_API_BASE_URL;

function SignPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pnum, setPnum] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('pnum', pnum);
    if (image) formData.append('image', image);

    try {
      const response = await axios.post(`${backendUrl}/api/user/register`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { token } = response.data;
      localStorage.setItem('token', token);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred during registration');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-800 to-purple-900 px-4 py-6 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

        {/* Left Section */}
        <div
          className="w-full md:w-1/2 relative flex flex-col justify-between p-6 sm:p-8 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-black opacity-40 z-0" />
          <div className="z-10 relative">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500" />
              <h1 className="text-3xl font-bold text-white">Lumin</h1>
            </div>
          </div>
          <div className="z-10 relative mt-auto">
            <h2 className="text-3xl font-bold text-white">Join Us</h2>
            <p className="text-lg text-white">Stay Vibrant!</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="w-full md:w-1/2 bg-gray-800 p-6 sm:p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-white mb-6 text-center md:text-left">Sign Up</h2>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              name='name'
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-bordered w-full bg-gray-700 text-white border-gray-600 focus:border-purple-500"
            />
            <input
              type="email"
              name='email'
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered w-full bg-gray-700 text-white border-gray-600 focus:border-purple-500"
            />
            <input
              type="password"
              name='password'
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered w-full bg-gray-700 text-white border-gray-600 focus:border-purple-500"
            />
            <input
              type="text"
              name='pnum'
              placeholder="Phone Number"
              value={pnum}
              onChange={(e) => setPnum(e.target.value)}
              className="input input-bordered w-full bg-gray-700 text-white border-gray-600 focus:border-purple-500"
            />
            <input
              type="file"
              name='image'
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="file-input file-input-bordered w-full bg-gray-700 text-white border-gray-600 focus:border-purple-500"
            />
            <button
              type="submit"
              className="btn w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none hover:from-purple-600 hover:to-pink-600"
            >
              Sign Up
            </button>
          </form>
          <div className="mt-6 text-sm text-gray-400 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-500 hover:text-orange-400">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignPage;
