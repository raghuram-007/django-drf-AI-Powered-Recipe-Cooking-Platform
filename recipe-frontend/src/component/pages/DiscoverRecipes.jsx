import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DiscoverRecipes = () => {
  const navigate = useNavigate();
  const [trendingRecipes, setTrendingRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    time_filter: 'current',
    dietary: ''
  });

  const discoverTrendingRecipes = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('access');
      const response = await axios.post(
        'https://django-drf-ai-powered-recipe-cooking.onrender.com/api/auth/ai/trending-recipes/',
        filters,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setTrendingRecipes(response.data.trending_data.trending_recipes || []);
      }
    } catch (error) {
      console.error('Trending recipes error:', error);
      alert('Failed to fetch trending recipes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getGuidedRecipe = async (recipe) => {
    try {
      const token = localStorage.getItem('access');
      
      // Call the AI recipe guide API
      const response = await axios.post(
        'https://django-drf-ai-powered-recipe-cooking.onrender.com/api/auth/ai/recipe-guide/',
        {
          recipe_title: recipe.title,
          recipe_instructions: recipe.description
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Navigate to guided cooking page with the AI-enhanced instructions
        navigate('/guided-cooking', { 
          state: { 
            originalRecipe: recipe,
            guidedInstructions: response.data.guided_instructions
          }
        });
      }
      
    } catch (error) {
      console.error('Guide generation error:', error);
      alert('Failed to generate cooking guide. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Discover Trending Recipes</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find what's popular right now and get AI-powered cooking guidance
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Find Trending Recipes</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select 
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any Category</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="dessert">Dessert</option>
                <option value="snack">Snack</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dietary</label>
              <select 
                value={filters.dietary}
                onChange={(e) => setFilters({...filters, dietary: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any Dietary</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="gluten-free">Gluten-Free</option>
                <option value="low-carb">Low-Carb</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select 
                value={filters.time_filter}
                onChange={(e) => setFilters({...filters, time_filter: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="current">Currently Trending</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>

          <button
            onClick={discoverTrendingRecipes}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Discovering Trends...' : '🔥 Discover Trending Recipes'}
          </button>
        </div>

        {/* Trending Recipes Grid */}
        {trendingRecipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingRecipes.map((recipe, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-800">{recipe.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      recipe.estimated_popularity === 'High' 
                        ? 'bg-green-100 text-green-800'
                        : recipe.estimated_popularity === 'Medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {recipe.estimated_popularity} Trend
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{recipe.description}</p>
                  
                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-700">Why it's trending:</span>
                    <p className="text-sm text-gray-600 mt-1">{recipe.trend_reason}</p>
                  </div>

                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-700">Key Ingredients:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {recipe.key_ingredients?.map((ingredient, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border">
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <span>⏱️ {recipe.prep_time + recipe.cook_time} min</span>
                    <span>📊 {recipe.difficulty}</span>
                    <span>👥 {recipe.servings || 4} servings</span>
                  </div>

                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-700">Viral Tips:</span>
                    <ul className="text-sm text-gray-600 list-disc list-inside mt-1 space-y-1">
                      {recipe.viral_tips?.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => getGuidedRecipe(recipe)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                  >
                    🧑‍🍳 Get AI Cooking Guide
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && trendingRecipes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Discover What's Cooking</h3>
            <p className="text-gray-500">Click the button above to find trending recipes with AI guidance</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Discovering trending recipes...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverRecipes;