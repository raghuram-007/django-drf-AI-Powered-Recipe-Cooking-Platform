// src/components/SignupForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignupForm = () => {
  const [signupData, setSignupData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigator = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Frontend validation
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (signupData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/signup/`, {
        full_name: signupData.fullName,
        email: signupData.email,
        password: signupData.password
      });
      setSuccess(response.data.message);
      setSignupData({ fullName: '', email: '', password: '', confirmPassword: '' });
      setTimeout(() => {
        navigator('/login');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  };

  // Cooking-themed icons
  const cookingIcons = {
    signup: '👨‍🍳',
    email: '📧',
    password: '🔒',
    user: '👤',
    success: '✅'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center items-center mb-5">
            <span className="text-6xl mr-3">🍳</span>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-rose-500 bg-clip-text text-transparent">
              RecipeShare
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Join our community of food lovers</p>
        </div>

        {/* Sign Up Form Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-16 hover:shadow-2xl transition-all duration-300 border border-white/20">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">{cookingIcons.signup}</div>
            <h2 className="text-2xl font-bold text-gray-800">Create Your Account</h2>
            <p className="text-gray-600 mt-1">Start sharing your recipes today</p>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm flex items-center">
              <span className="mr-2">❌</span>
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl mb-4 text-sm flex items-center">
              <span className="mr-2">{cookingIcons.success}</span>
              {success}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            {/* Full Name Field */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <span className="mr-2">{cookingIcons.user}</span>
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={signupData.fullName}
                onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <span className="mr-2">{cookingIcons.email}</span>
                Email Address
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <span className="mr-2">{cookingIcons.password}</span>
                Password
              </label>
              <input
                type="password"
                placeholder="At least 8 characters"
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                required
              />
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <span className="mr-2">✅</span>
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm your password"
                value={signupData.confirmPassword}
                onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-400 to-rose-500 text-white py-4 px-4 rounded-xl font-semibold hover:from-orange-500 hover:to-rose-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Account
            </button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <a href="/login" className="text-orange-500 hover:text-orange-600 font-semibold transition-colors duration-200">
                Sign in here
              </a>
            </p>
          </div>
        </div>

        {/* Decorative Cooking Elements */}
        <div className="text-center mt-8">
          <div className="flex justify-center space-x-4 text-2xl opacity-40">
            <span>🍕</span>
            <span>🥗</span>
            <span>🍝</span>
            <span>🍰</span>
            <span>☕</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
