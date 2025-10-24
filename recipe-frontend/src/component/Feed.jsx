// src/components/Feed.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Feed = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_BASE = process.env.REACT_APP_API_URL; // Correctly read from .env

  // Create an axios instance with base URL
  const axiosInstance = axios.create({
    baseURL: API_BASE,
    headers: {
      Authorization: localStorage.getItem("access") 
        ? `Bearer ${localStorage.getItem("access")}` 
        : ""
    },
  });

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get('/api/auth/feed/');
      setRecipes(response.data);
    } catch (err) {
      console.error('Error fetching feed:', err);
      setError('Failed to load your feed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const RecipeCard = ({ recipe }) => {
    const isShared = recipe.type === 'shared';
    const authorName = isShared ? recipe.shared_by : recipe.author;
    const date = isShared
      ? recipe.shared_at
        ? new Date(recipe.shared_at).toLocaleDateString()
        : ''
      : recipe.created_at
      ? new Date(recipe.created_at).toLocaleDateString()
      : '';

    const imageUrl = recipe.image || recipe.recipe_image
      ? (recipe.image || recipe.recipe_image).startsWith('http')
        ? recipe.image || recipe.recipe_image
        : `${API_BASE}${recipe.image || recipe.recipe_image}`
      : null;

    const handleCardClick = () => {
      const targetId = isShared ? recipe.recipe_id : recipe.id;
      navigate(`/recipe/${targetId}`);
    };

    return (
      <div
        onClick={handleCardClick}
        className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 group"
      >
        {imageUrl && (
          <div className="overflow-hidden">
            <img
              src={imageUrl}
              alt={recipe.title || recipe.recipe_title}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <div className="p-6">
          <h3 className="font-semibold text-lg mb-3 text-gray-800 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1">
            {recipe.title || recipe.recipe_title}
          </h3>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span className="bg-gray-100 px-3 py-1 rounded-lg text-xs font-medium">
              👤 {authorName || 'Unknown'} {isShared && '(Shared)'}
            </span>
            <span className="text-xs text-gray-500">{date}</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading your personalized feed...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={fetchFeed}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Your Recipe Feed</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover the latest recipes from users you follow
          </p>
          <button
            onClick={fetchFeed}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Refresh Feed
          </button>
        </div>

        {recipes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">👥</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Your feed is empty</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start following other users to see their recipes here!
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/recipe"
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Explore Recipes
              </Link>
              <Link
                to="/dashboard"
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map(recipe => {
              const key = recipe.type === 'shared' ? `shared-${recipe.id}` : `recipe-${recipe.id}`;
              return <RecipeCard key={key} recipe={recipe} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
