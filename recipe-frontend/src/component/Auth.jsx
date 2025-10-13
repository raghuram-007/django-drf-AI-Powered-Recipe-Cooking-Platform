// recipe-frontend/src/components/AuthUI.jsx
import React, { useState } from 'react';

const AuthUI = () => {
  const [isLogin, setIsLogin] = useState(true);

  const cookingIcons = {
    signup: '👨‍🍳',
    login: '🔐',
    email: '📧',
    password: '🔒',
    user: '👤'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center mb-4">
          <span className="text-5xl mr-3">🍳</span>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-rose-500 bg-clip-text text-transparent">
            RecipeShare
          </h1>
        </div>
        <p className="text-gray-600 text-lg">Join our community of food lovers</p>
      </div>

      {/* Forms Container */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-start">
        
        {/* Sign Up Form */}
        <div
          className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 ${
            !isLogin ? 'opacity-100' : 'opacity-50'
          }`}
        >
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">{cookingIcons.signup}</div>
            <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
            <p className="text-gray-600">Join our recipe community</p>
          </div>

          <form className="space-y-5">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
            />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
            />
            <button
              type="button"
              className="w-full bg-gradient-to-r from-orange-400 to-rose-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-orange-500 hover:to-rose-600 shadow-lg"
            >
              Create Account
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => setIsLogin(true)}
                className="text-orange-500 hover:text-orange-600 font-semibold"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div
          className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 ${
            isLogin ? 'opacity-100' : 'opacity-50'
          }`}
        >
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">{cookingIcons.login}</div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          <form className="space-y-5">
            <input
              type="email"
              placeholder="Email Address"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
            />
            <button
              type="button"
              className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-500 hover:to-blue-600 shadow-lg"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => setIsLogin(false)}
                className="text-green-500 hover:text-green-600 font-semibold"
              >
                Create one here
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Cooking Icons */}
      <div className="text-center mt-8">
        <div className="flex justify-center space-x-4 text-2xl opacity-60">
          <span>🍕</span>
          <span>🥗</span>
          <span>🍝</span>
          <span>🍰</span>
          <span>☕</span>
        </div>
      </div>
    </div>
  );
};

export default AuthUI;
