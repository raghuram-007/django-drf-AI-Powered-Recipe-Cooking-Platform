import { useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const [login, setLogin] = useState({ email: '', password: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlechange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!login.email || !login.password) {
      setError('All fields are required');
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login/`, {
        email: login.email,
        password: login.password
      });

      // Save tokens and user email
      localStorage.setItem('access', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);
      localStorage.setItem('user_email', login.email);
      localStorage.setItem('user_id', response.data.user_id);

      // ✅ Notify Navbar to update immediately
      window.dispatchEvent(new Event("login"));

      setSuccess(response.data.message || 'Login successful');
      setLogin({ email: '', password: '' });

      // Redirect after success
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);

    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-10 border border-white/20 hover:shadow-2xl transition-all duration-300">
        <div className="text-center mb-8">
          <span className="text-5xl">🍳</span>
          <h1 className="text-3xl font-bold text-gray-800 mt-2">RecipeShare Login</h1>
          <p className="text-gray-600 mt-1">Sign in to access your recipes</p>
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
            <span className="mr-2">✅</span>
            {success}
          </div>
        )}

        <form onSubmit={handlechange} className="space-y-6">
          {/* Email */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">📧 Email Address</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={login.email}
              onChange={(e) => setLogin({ ...login, email: e.target.value })}
              className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition-all duration-200 placeholder-gray-400"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">🔒 Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={login.password}
              onChange={(e) => setLogin({ ...login, password: e.target.value })}
              className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition-all duration-200 placeholder-gray-400"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-400 to-rose-500 text-white py-4 px-4 rounded-xl font-semibold hover:from-orange-500 hover:to-rose-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <a href="/signup" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors duration-200">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
