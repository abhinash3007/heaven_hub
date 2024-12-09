
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { signInStart, signInSuccess, signInFailure } from '../redux/user/userSlice';
import Oath from '../components/Oath';

const SignIn = () => {
  const [formData, setFormData] = useState({});
  const { error, loading } = useSelector((state) => state.user);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(signInStart());
      const res = await fetch(`/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success === false) {
        dispatch(signInFailure(data.message));
        return;
      }
      dispatch(signInSuccess(data));
      navigate('/');
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  return (
    <div className="flex justify-center items-center mt-20 min-h-screen bg-gray-100">
      <div className="p-6 max-w-md w-full bg-white rounded-lg shadow-md">
        <h1 className="text-3xl text-center mb-6 font-semibold text-blue-600">Sign In</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button
            disabled={loading}
            className="border disabled:opacity-80 rounded-lg p-3 bg-blue-600 text-white uppercase hover:bg-blue-700 transition duration-300"
          >
            {loading ? 'Loading...' : 'Sign In'}
          </button>
          <Oath />
        </form>
        <div className="flex mt-5 gap-2 justify-center">
          <p>Don’t have an account?</p>
          <Link to="/sign-up">
            <span className="text-blue-600 hover:underline">Sign Up</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
