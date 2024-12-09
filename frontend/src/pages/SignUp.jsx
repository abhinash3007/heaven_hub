
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Oath from '../components/Oath';

const SignUp = () => {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch(`/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setLoading(false);

      if (data.success === false) {
        setError(data.message || 'Sign up failed');
        return;
      }

      setError(null);
      navigate('/sign-in');
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  return (
    <div className="flex justify-center mt-20 items-center min-h-screen bg-gray-100">
      <div className="p-6 max-w-md w-full bg-white rounded-lg shadow-md">
        <h1 className="text-3xl text-center mb-6 font-semibold text-blue-600">Sign Up</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Username"
              className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="userName"
              value={formData.userName}
              onChange={handleChange}
              required
            />
          </div>
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
            {loading ? 'Loading...' : 'Sign Up'}
          </button>
          <Oath />
        </form>
        <div className="flex mt-5 gap-2 justify-center">
          <p>Already have an account?</p>
          <Link to="/sign-in">
            <span className="text-blue-600 hover:underline">Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
