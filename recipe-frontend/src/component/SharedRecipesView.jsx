// src/components/SharedRecipesView.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE = `${process.env.REACT_APP_API_URL}`;

const SharedRecipesView = () => {
  const [sharedData, setSharedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSharer, setSelectedSharer] = useState(null);
  const [markingRead, setMarkingRead] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("access");
  const config = {
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  };

  const fetchSharedRecipes = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/auth/shared-recipes/`, config);
      setSharedData(response.data);
    } catch (error) {
      console.error('Error fetching shared recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSharedRecipes();
  }, []);

  const markAsRead = async (shareId) => {
    setMarkingRead(shareId);
    try {
      await axios.patch(
        `${API_BASE}/api/auth/shared-recipes/${shareId}/read/`,
        {},
        config
      );
      // Update local state
      setSharedData(prev => 
        prev.map(sharer => ({
          ...sharer,
          shared_recipes: sharer.shared_recipes.map(recipe =>
            recipe.share_id === shareId ? { ...recipe, is_read: true } : recipe
          ),
          unread_count: recipe.share_id === shareId ? Math.max(0, sharer.unread_count - 1) : sharer.unread_count
        }))
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    } finally {
      setMarkingRead(null);
    }
  };

  const handleRecipeClick = (recipeId, shareId, isRead) => {
    if (!isRead) {
      markAsRead(shareId);
    }
    navigate(`/recipe/${recipeId}`);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return imagePath.startsWith("http") ? imagePath : `${API_BASE}${imagePath}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="fade-in min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Shared Recipes</h1>
          <p className="text-gray-600 text-lg">Recipes shared with you by other users</p>
        </div>

        {sharedData.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">📤</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">No shared recipes yet</h3>
            <p className="text-gray-600">When users share recipes with you, they will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Sharers List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Shared By</h2>
                <div className="space-y-3">
                  {sharedData.map((sharer) => (
                    <button
                      key={sharer.sharer_id}
                      onClick={() => setSelectedSharer(sharer.sharer_id)}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                        selectedSharer === sharer.sharer_id
                          ? 'bg-purple-500 text-white shadow-lg transform -translate-y-0.5'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                            {sharer.sharer_username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold">{sharer.sharer_username}</p>
                            <p className="text-sm opacity-75">{sharer.total_shared} recipes</p>
                          </div>
                        </div>
                        {sharer.unread_count > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                            {sharer.unread_count}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content - Shared Recipes */}
            <div className="lg:col-span-3">
              {selectedSharer ? (
                (() => {
                  const sharer = sharedData.find(s => s.sharer_id === selectedSharer);
                  return (
                    <div>
                      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                            {sharer.sharer_username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-800">{sharer.sharer_username}</h2>
                            <p className="text-gray-600">
                              Shared {sharer.total_shared} recipe{sharer.total_shared !== 1 ? 's' : ''} with you
                              {sharer.unread_count > 0 && (
                                <span className="ml-2 bg-red-100 text-red-600 px-2 py-1 rounded-full text-sm">
                                  {sharer.unread_count} unread
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sharer.shared_recipes.map((recipe) => (
                          <div
                            key={recipe.share_id}
                            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 group cursor-pointer"
                            onClick={() => handleRecipeClick(recipe.recipe_id, recipe.share_id, recipe.is_read)}
                          >
                            {/* Image */}
                            {recipe.recipe_image && (
                              <div className="overflow-hidden relative">
                                <img
                                  src={getImageUrl(recipe.recipe_image)}
                                  alt={recipe.recipe_title}
                                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                {!recipe.is_read && (
                                  <div className="absolute top-3 right-3">
                                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                                      New
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Content */}
                            <div className="p-6">
                              <h3 className="font-semibold text-lg mb-3 text-gray-800 group-hover:text-purple-600 transition-colors duration-200 line-clamp-1">
                                {recipe.recipe_title}
                              </h3>
                              
                              <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                                {recipe.recipe_description}
                              </p>

                              {/* Message */}
                              {recipe.message && (
                                <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                  <p className="text-sm text-purple-700">"{recipe.message}"</p>
                                </div>
                              )}

                              {/* Footer */}
                              <div className="flex justify-between items-center text-sm text-gray-500">
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    recipe.is_read 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {recipe.is_read ? '✓ Read' : 'Unread'}
                                  </span>
                                  <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                                    {new Date(recipe.shared_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRecipeClick(recipe.recipe_id, recipe.share_id, recipe.is_read);
                                  }}
                                  className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                                >
                                  {markingRead === recipe.share_id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                                  ) : (
                                    'View Recipe'
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">👆</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Select a user</h3>
                  <p className="text-gray-600">Choose a user from the sidebar to see the recipes they shared with you.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedRecipesView;