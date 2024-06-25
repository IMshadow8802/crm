import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import API_BASE_URL from '../config/config';
import useAuthStore from '../zustand/authStore';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  // Use the authentication state and actions from useAuthStore
  const { isAuthenticated, login } = useAuthStore();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!username || !password) {
      enqueueSnackbar('Username or password field is empty', { variant: 'error' });
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/User/fetchUser_Validate`, {
        username,
        password,
      });
      const userData = response.data;

        localStorage.setItem('userData', JSON.stringify(userData[0]));
        login(); // Update authentication state
        enqueueSnackbar('Successfully logged in', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Error logging in. Please try again.', { variant: 'error' });
    }
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData && isAuthenticated) {
      // You can still perform actions if needed without setUser
    }
  }, [isAuthenticated]);

  return (
    <div className="h-full w-full bg-white flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-gray-100 rounded-md shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center">eStock+</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="username" className="block text-sm font-semibold text-gray-600">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-600">
                Password
              </label>
              <div className="text-right">
                <a href="#" className="text-blue-500">Forgot Password?</a>
              </div>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="mb-6">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;