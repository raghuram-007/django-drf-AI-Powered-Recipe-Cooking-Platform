// src/component/homepage/RecipeGrid.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Use environment variable with fallback
const API_BASE_URL = process.env.REACT_APP_API_URL || "https://django-drf-ai-powered-recipe-cooking.onrender.com";

const RecipeGrid = ({ recipes, title = "All Recipes" }) => {
  const navigate = useNavigate();

  if (!recipes || recipes.length === 0) return null;

  // Show only first 5 recipes
  const displayedRecipes = recipes.slice(0, 4);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return imagePath.startsWith('http') ? imagePath : `${API_BASE_URL}${imagePath}`;
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            {title}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Explore our complete collection of delicious recipes
          </p>
        </div>
        
        <Link to="/recipe">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {displayedRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-2"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={getImageUrl(recipe.image)}
                    alt={recipe.title}
                    className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src =
                        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgODBMMTUwIDE3MEgyNTBMMjAwIDgwWiIgZmlsbD0iI0Q0RDhEQyIvPgo8Y2lyY2xlIGN4PSIyMDAiIGN5PSIyMDAiIHI9IjI1IiBmaWxsPSIjRDREOERDIi8+Cjwvc3ZnPg==';
                    }}
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-gray-700 transition-colors">
                    {recipe.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {recipe.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">
                          {recipe.author?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                          {recipe.author || 'Unknown Chef'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {recipe.created_at ? new Date(recipe.created_at).toLocaleDateString() : 'Recently'}
                        </p>
                      </div>
                    </div>
                    <div className="text-amber-600 hover:text-amber-700 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Link>

        {/* Load More Button */}
        {recipes.length > 5 && (
          <div className="flex justify-center mt-12">
            <button
              onClick={() => navigate('/recipe')}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Load More Recipes
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default RecipeGrid;