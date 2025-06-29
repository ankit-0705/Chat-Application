import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/Logo.jpg';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate=useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/user/login`, {
        email,
        password,
      });
      const { jwtToken } = response.data;
      localStorage.setItem('token', jwtToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred during login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-800 to-purple-900 px-4 py-6 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

        {/* Left Side */}
        <div
          className="w-full md:w-1/2 relative flex flex-col justify-between p-6 sm:p-8 bg-cover bg-center min-h-[300px]"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-black opacity-40 z-0"></div>
          <div className="z-10 relative">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500"></div>
              <h1 className="text-3xl font-bold text-white">Lumin</h1>
            </div>
          </div>
          <div className="z-10 relative mt-auto">
            <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
            <p className="text-lg text-white">Stay Vibrant!</p>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 bg-gray-800 p-6 sm:p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-white mb-6 text-center md:text-left">Login</h2>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered w-full bg-gray-700 text-white border-gray-600 focus:border-purple-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered w-full bg-gray-700 text-white border-gray-600 focus:border-purple-500"
            />
            <button
              type="submit"
              className="btn w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none hover:from-purple-600 hover:to-pink-600"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-sm text-gray-400 text-center space-y-2">
            <a href="#" className="hover:text-gray-200">Forgot password?</a>
            <p>
              Don’t have an account?{' '}
              <Link to="/" className="text-orange-500 hover:text-orange-400">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
