// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axios.js';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// ----------------------- SharedRecipesView Component -----------------------
const SharedRecipesView = () => {
  const [sharedData, setSharedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSharer, setSelectedSharer] = useState(null);
  const [markingRead, setMarkingRead] = useState(null);
  const navigate = useNavigate();

  const API_BASE = "https://django-drf-ai-powered-recipe-cooking.onrender.com";

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
          unread_count: sharer.shared_recipes.filter(r => r.share_id === shareId && !r.is_read).length > 0 
            ? Math.max(0, sharer.unread_count - 1) 
            : sharer.unread_count
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

// ----------------------- FeedView Component -----------------------
const FeedView = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/feed/');
      setRecipes(response.data);
    } catch (err) {
      console.error('Error fetching feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const RecipeCard = ({ recipe }) => {
    const handleCardClick = () => {
      navigate(`/recipe/${recipe.id}`);
    };

    return (
      <div
        onClick={handleCardClick}
        className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 group"
      >
        {recipe.image && (
          <div className="overflow-hidden">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <div className="p-6">
          <h3 className="font-semibold text-lg mb-3 text-gray-800 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1">
            {recipe.title}
          </h3>
          <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
            <span className="bg-gray-100 px-3 py-1 rounded-lg text-xs font-medium">
              👤 {recipe.author || '—'}
            </span>
            <span className="text-xs text-gray-500">
              {recipe.created_at ? new Date(recipe.created_at).toLocaleDateString() : ''}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
   <div className="fade-in">
  <div className="flex justify-between items-center mb-8">
    <h1 className="text-3xl font-bold text-gray-800">My Feed</h1>
    <button
      onClick={fetchFeed}
      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
    >
      Refresh
    </button>
  </div>
  
  {loading ? (
    <LoadingSpinner />
  ) : recipes.length === 0 ? (
    <EmptyMessage text="Follow other users to see their recipes here!" />
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map(item => {
        // Create a unique key
        const key = item.type === 'shared' ? `shared-${item.id}` : `recipe-${item.id}`;
        return <RecipeCard key={key} recipe={item} />;
      })}
    </div>
  )}
</div>

  );
};

// ----------------------- Reusable Components -----------------------
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100 group">
    <div className="flex items-center">
      <div className="text-2xl mr-4 text-gray-600 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <div>
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</h3>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
    </div>
  </div>
);

const RecipeCard = ({ recipe, onDelete, onEdit }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/recipe/${recipe.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 group"
    >
      {recipe.image && (
        <div className="overflow-hidden">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-6">
        <h3 className="font-semibold text-lg mb-3 text-gray-800 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1">
          {recipe.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {recipe.description}
        </p>

        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
          <span className="bg-gray-100 px-3 py-1 rounded-lg text-xs font-medium">👤 {recipe.author || '—'}</span>
          <span className="flex items-center bg-yellow-50 px-3 py-1 rounded-lg text-xs font-medium">
            ⭐ {recipe.favorites_count ?? 0} favorites
          </span>
        </div>

        <div className="flex justify-between items-center mb-2 pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
            {recipe.created_at ? new Date(recipe.created_at).toLocaleDateString() : ''}
          </span>
          <div className="flex space-x-3">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(recipe.id);
                }}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(recipe.id);
                }}
                className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {recipe.related_recipes?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="font-semibold text-gray-700 mb-2 text-sm">Related Recipes:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              {recipe.related_recipes.map(r => (
                <li key={r.id} className="bg-gray-50 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors duration-200">
                  {r.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------- Dashboard -----------------------
const Dashboard = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('dashboard');

  // Global data slices
  const [recipes, setRecipes] = useState([]);
  const [userRecipes, setUserRecipes] = useState([]);
  const [comments, setComments] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loadingGlobal, setLoadingGlobal] = useState(false);

  const userEmail = localStorage.getItem('user_email') || null;
  const access = localStorage.getItem('access');

  useEffect(() => {
    if (!access) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, []); // eslint-disable-line

  const parseList = (res) => res.data?.results ?? res.data ?? [];

  const fetchDashboardData = async () => {
    setLoadingGlobal(true);
    try {
      const [
        recipesRes,
        myRecipesRes,
        commentsRes,
        favoritesRes,
        ratingsRes,
        categoriesRes,
      ] = await Promise.allSettled([
        axiosInstance.get('/recipes/'),
        axiosInstance.get('/user-recipes/'),
        axiosInstance.get('/user-comments/'),
        axiosInstance.get('/user-favorites/'),
        axiosInstance.get('/user-ratings/'),
        axiosInstance.get('/categories/'),
      ]);

      if (recipesRes.status === 'fulfilled') setRecipes(parseList(recipesRes.value));
      if (myRecipesRes.status === 'fulfilled') setUserRecipes(parseList(myRecipesRes.value));
      if (commentsRes.status === 'fulfilled') setComments(parseList(commentsRes.value));
      if (favoritesRes.status === 'fulfilled') setFavorites(parseList(favoritesRes.value));
      if (ratingsRes.status === 'fulfilled') setRatings(parseList(ratingsRes.value));
      if (categoriesRes.status === 'fulfilled') setCategories(parseList(categoriesRes.value));
    } catch (err) {
      console.error('Dashboard fetch error', err);
    } finally {
      setLoadingGlobal(false);
    }
  };

  const fetchData = async (endpoint, setter) => {
    try {
      const res = await axiosInstance.get(endpoint);
      setter(res.data?.results ?? res.data ?? []);
    } catch (err) {
      console.error(`Error fetching ${endpoint}`, err);
    }
  };

  const handleNavigateToFeed = () => {
    navigate('/feed');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="fade-in">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <button
                onClick={handleNavigateToFeed}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-6 rounded-2xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 text-left group"
              >
                <div className="flex items-center">
                  <div className="text-2xl mr-4 group-hover:scale-110 transition-transform duration-300">📰</div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">View Your Feed</h3>
                    <p className="text-purple-100 text-sm">See recipes from users you follow</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => navigate('/recipe')}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-6 rounded-2xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 text-left group"
              >
                <div className="flex items-center">
                  <div className="text-2xl mr-4 group-hover:scale-110 transition-transform duration-300">🔍</div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Explore Recipes</h3>
                    <p className="text-green-100 text-sm">Discover new recipes and users</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setCurrentView('my-recipes')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 rounded-2xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 text-left group"
              >
                <div className="flex items-center">
                  <div className="text-2xl mr-4 group-hover:scale-110 transition-transform duration-300">📝</div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Create Recipe</h3>
                    <p className="text-blue-100 text-sm">Share your own recipes</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="My Recipes" value={userRecipes.length} icon="📝" />
              <StatCard title="My Comments" value={comments.length} icon="💬" />
              <StatCard title="My Favorites" value={favorites.length} icon="⭐" />
              <StatCard title="All Recipes" value={recipes.length} icon="🍳" />
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Welcome{userEmail ? `, ${userEmail}` : ''}</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Manage your recipes, comments, favorites, and ratings from the navigation menu.
              </p>
              <p className="text-gray-600 leading-relaxed">
                <strong>New:</strong> Follow other users and see their recipes in your personalized feed!
              </p>
            </div>
          </div>
        );
      case 'my-recipes':
        return <MyRecipesView recipes={userRecipes} onFetch={() => fetchData('/user-recipes/', setUserRecipes)} />;
      case 'my-comments':
        return <MyCommentsView comments={comments} onFetch={() => fetchData('/user-comments/', setComments)} />;
      case 'my-favorites':
        return <MyFavoritesView favorites={favorites} onFetch={() => fetchData('/user-favorites/', setFavorites)} />;
      case 'my-ratings':
        return <MyRatingsView ratings={ratings} onFetch={() => fetchData('/user-ratings/', setRatings)} />;
      case 'categories':
        return <CategoriesView categories={categories} onFetch={() => fetchData('/categories/', setCategories)} />;
      case 'all-recipes':
        return <AllRecipesView recipes={recipes} onFetch={() => fetchData('/recipes/', setRecipes)} />;
      case 'feed':
        return <FeedView />;
      case 'shared-recipes':
        return <SharedRecipesView />;
      default:
        return null;
    }
  };

  if (!access) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar + Main */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen p-6 border-r border-gray-200">
          <h2 className="text-3lg font-semibold mb-6 text-gray-700 uppercase tracking-wide text-sm">Navigation</h2>
          <nav className="space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'my-recipes', label: 'My Recipes', icon: '📝' },
              { id: 'my-comments', label: 'My Comments', icon: '💬' },
              { id: 'my-favorites', label: 'My Favorites', icon: '⭐' },
              { id: 'my-ratings', label: 'My Ratings', icon: '🌟' },
              { id: 'all-recipes', label: 'All Recipes', icon: '🍳' },
              { id: 'categories', label: 'Categories', icon: '📂' },
              { id: 'feed', label: 'My Feed', icon: '📰' },
              { id: 'shared-recipes', label: 'Shared Recipes', icon: '📤' }, // ADDED: Shared Recipes navigation
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center space-x-3 transition-all duration-200 ${
                  currentView === item.id
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform -translate-y-0.5'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">
          {loadingGlobal ? (
            <LoadingSpinner />
          ) : (
            renderView()
          )}
        </div>
      </div>
    </div>
  );
};

// ----------------------- Subviews -----------------------
const MyRecipesView = ({ recipes, onFetch }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    try {
      await axiosInstance.delete(`/user-recipes/${id}/`);
      onFetch();
    } catch (err) {
      console.error('Delete error', err);
      alert('Failed to delete. Backend enforces permissions.');
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-recipe/${id}`);
  };

  useEffect(() => { setLoading(true); onFetch().finally(() => setLoading(false)); }, []);

  return (
    <div className="fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Recipes</h1>
      {loading ? <LoadingSpinner /> : recipes.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map(r => (
            <RecipeCard key={r.id} recipe={r} onDelete={handleDelete} onEdit={handleEdit} />
          ))}
        </div>
      ) : <EmptyMessage text="You haven't created any recipes yet." />}
    </div>
  );
};

const MyCommentsView = ({ comments, onFetch }) => {
  const [loading, setLoading] = useState(false);
  const [editCommentId, setEditCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => { setLoading(true); onFetch().finally(() => setLoading(false)); }, []);

  const handleEdit = (comment) => {
    setEditCommentId(comment.id);
    setEditContent(comment.content);
  };

  const handleSave = async (id) => {
    try {
      await axiosInstance.put(`/user-comments/${id}/`, { content: editContent });
      setEditCommentId(null);
      onFetch();
    } catch (err) {
      console.error(err);
      alert('Failed to update comment');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await axiosInstance.delete(`/user-comments/${id}/`);
      onFetch();
    } catch (err) {
      console.error(err);
      alert('Failed to delete comment');
    }
  };

  return (
    <div className="fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Comments</h1>
      {loading ? <LoadingSpinner /> : comments.length ? (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {comments.map(c => (
            <div key={c.id} className="border-b border-gray-100 last:border-b-0 p-6 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-gray-800 text-lg">{c.recipe_title ?? '—'}</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">{c.date_created ? new Date(c.date_created).toLocaleDateString() : ''}</span>
              </div>
              {editCommentId === c.id ? (
                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="border border-gray-300 rounded-lg p-3 flex-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <button onClick={() => handleSave(c.id)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium">Save</button>
                  <button onClick={() => setEditCommentId(null)} className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-all duration-200 font-medium">Cancel</button>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">{c.content}</p>
                  <div className="flex gap-3">
                    <button onClick={() => handleEdit(c)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium">Edit</button>
                    <button onClick={() => handleDelete(c.id)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : <EmptyMessage text="You haven't posted any comments yet." />}
    </div>
  );
};

const MyFavoritesView = ({ favorites, onFetch }) => {
  const [loading, setLoading] = useState(false);

  const handleRemove = async (id) => {
    if (!window.confirm('Remove from favorites?')) return;
    try {
      await axiosInstance.delete(`/user-favorites/${id}/`);
      onFetch();
    } catch (err) {
      console.error(err);
      alert('Failed to remove favorite');
    }
  };

  useEffect(() => {
    setLoading(true);
    onFetch().finally(() => setLoading(false));
  }, []);

  return (
    <div className="fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Favorites</h1>
      {loading ? (
        <LoadingSpinner />
      ) : favorites.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(f => (
            <div key={f.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 group">
              <h3 className="font-semibold text-lg mb-3 text-gray-800 group-hover:text-blue-600 transition-colors duration-200">{f.recipe_title ?? '—'}</h3>
              {f.recipe_image && (
                <div className="overflow-hidden rounded-lg mb-4">
                  <img
                    src={f.recipe_image}
                    alt={f.recipe_title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <p className="text-gray-600 mb-3 bg-gray-50 px-3 py-2 rounded-lg text-sm">By: {f.author_username ?? '—'}</p>
              <p className="text-sm text-gray-500 mb-4 bg-blue-50 px-3 py-2 rounded-lg">
                Added: {f.date_added ? new Date(f.date_added).toLocaleDateString() : '—'}
              </p>
              <button
                onClick={() => handleRemove(f.id)}
                className="text-red-600 hover:text-red-800 hover:bg-red-50 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium w-full"
              >
                Remove from Favorites
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyMessage text="You haven't added any favorites yet." />
      )}
    </div>
  );
};

const MyRatingsView = ({ ratings, onFetch }) => {
  const [loading, setLoading] = useState(false);
  const [editRatingId, setEditRatingId] = useState(null);
  const [newStars, setNewStars] = useState(0);

  useEffect(() => { setLoading(true); onFetch().finally(() => setLoading(false)); }, []);

  const handleEdit = (r) => {
    setEditRatingId(r.id);
    setNewStars(r.stars);
  };

  const handleSave = async (id) => {
    try {
      await axiosInstance.put(`/user-ratings/${id}/`, { stars: newStars });
      setEditRatingId(null);
      onFetch();
    } catch (err) {
      console.error(err);
      alert('Failed to update rating');
    }
  };

  return (
    <div className="fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Ratings</h1>
      {loading ? <LoadingSpinner /> : ratings.length ? (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {ratings.map(r => (
            <div key={r.id} className="border-b border-gray-100 last:border-b-0 p-6 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800 text-lg">{r.recipe_title ?? '—'}</h3>
                {editRatingId === r.id ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-2">
                      <input type="number" min="1" max="5" value={newStars} onChange={e => setNewStars(e.target.value)} className="w-16 text-center border-none focus:ring-0 font-semibold text-gray-800" />
                      <span className="text-gray-500 text-sm">/ 5</span>
                    </div>
                    <button onClick={() => handleSave(r.id)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium">Save</button>
                    <button onClick={() => setEditRatingId(null)} className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-all duration-200 font-medium">Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-yellow-50 px-3 py-2 rounded-lg">
                      <span className="text-yellow-500 text-lg">⭐</span>
                      <span className="ml-1 font-semibold text-gray-800">{r.stars}/5</span>
                    </div>
                    <button onClick={() => handleEdit(r)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium">Edit</button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">Rated on: {r.date_created ? new Date(r.date_created).toLocaleDateString() : ''}</p>
            </div>
          ))}
        </div>
      ) : <EmptyMessage text="You haven't rated any recipes yet." />}
    </div>
  );
};

const CategoriesView = ({ categories, onFetch }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    onFetch().finally(() => setLoading(false));
  }, []);

  const getImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `http://localhost:8000${url}`;
  };

  const handleCategoryClick = (id) => {
    navigate(`/category/${id}`);
  };

  return (
    <div className="fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Categories</h1>
      {loading ? (
        <LoadingSpinner />
      ) : categories.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((c) => (
            <div
              key={c.id}
              onClick={() => handleCategoryClick(c.id)}
              className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-100 group"
            >
              {c.cat_image ? (
                <div className="overflow-hidden rounded-full w-20 h-20 mx-auto mb-4 border-4 border-white shadow-lg group-hover:border-blue-100 transition-colors duration-300">
                  <img
                    src={getImageUrl(c.cat_image)}
                    alt={c.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl text-gray-400 border-4 border-white shadow-lg group-hover:border-blue-100 transition-colors duration-300">
                  🍽️
                </div>
              )}
              <h3 className="font-bold text-lg mb-2 text-gray-800 group-hover:text-blue-600 transition-colors duration-200">{c.name}</h3>
              <p className="text-gray-600 bg-gray-50 px-3 py-1 rounded-full text-sm">{c.recipes_count ?? 0} recipes</p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyMessage text="No categories found." />
      )}
    </div>
  );
};

const AllRecipesView = ({ recipes, onFetch }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('user_email') || null;

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    try {
      await axiosInstance.delete(`/user-recipes/${id}/`);
      onFetch();
    } catch (err) {
      console.error('Delete error', err);
      alert('Failed to delete. Backend enforces permissions.');
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-recipe/${id}`);
  };

  useEffect(() => { setLoading(true); onFetch().finally(() => setLoading(false)); }, []);

  return (
    <div className="fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">All Recipes</h1>
      {loading ? <LoadingSpinner /> : recipes.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map(r => (
            <RecipeCard
              key={r.id}
              recipe={r}
              onDelete={r.author_username === userEmail ? handleDelete : undefined}
              onEdit={r.author_username === userEmail ? handleEdit : undefined}
            />
          ))}
        </div>
      ) : <EmptyMessage text="No recipes found." />}
    </div>
  );
};

// ----------------------- Helpers -----------------------
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent shadow-lg"></div>
  </div>
);

const EmptyMessage = ({ text }) => (
  <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <span className="text-2xl text-gray-400">📄</span>
    </div>
    <p className="text-gray-500 text-lg">{text}</p>
  </div>
);

export default Dashboard;