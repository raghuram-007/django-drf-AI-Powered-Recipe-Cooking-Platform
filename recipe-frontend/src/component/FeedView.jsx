// src/components/FeedView.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Using axios directly
import { useNavigate } from 'react-router-dom';

const API_BASE = `${process.env.REACT_APP_API_URL}`; // Inline base URL

const FeedView = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchFeed = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE}/api/auth/feed/`);
      setRecipes(response.data);
    } catch (err) {
      console.error('Error fetching feed:', err);
      setError('Failed to load feed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

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

    const imageUrl = recipe.recipe_image || recipe.image
      ? (recipe.recipe_image || recipe.image).startsWith('http')
        ? recipe.recipe_image || recipe.image
        : `${API_BASE}${recipe.recipe_image || recipe.image}`
      : null;

    const handleCardClick = () => {
      const targetId = isShared ? recipe.recipe_id : recipe.id;
      navigate(`/recipe/${targetId}`);
    };

    return (
      <div
        onClick={handleCardClick}
        className="relative bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 group"
      >
        {/* Image */}
        {imageUrl && (
          <div className="overflow-hidden">
            <img
              src={imageUrl}
              alt={recipe.recipe_title || recipe.title}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        {/* Shared Tooltip */}
        {isShared && (
          <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Shared by {recipe.shared_by}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <h3 className="font-semibold text-lg mb-3 text-gray-800 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1">
            {recipe.recipe_title || recipe.title}
          </h3>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span className="bg-gray-100 px-3 py-1 rounded-lg text-xs font-medium">
              👤 {authorName || 'Unknown'}
              {isShared && ' (Shared)'}
            </span>
            <span className="text-xs text-gray-500">{date}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fade-in min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Feed</h1>
          <button
            onClick={fetchFeed}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-8 bg-white rounded-2xl shadow-lg mb-6">
            <p className="text-red-500 text-lg">{error}</p>
            <button
              onClick={fetchFeed}
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty Feed */}
        {!loading && recipes.length === 0 && !error && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-gray-500 text-lg">
              Follow other users to see their recipes here!
            </p>
          </div>
        )}

        {/* Recipes Grid */}
        {!loading && recipes.length > 0 && (
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

export default FeedView;
