// src/components/category/CategoryRecipes.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { useParams, useNavigate } from "react-router-dom";

const CategoryRecipes = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryRecipes = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://django-drf-ai-powered-recipe-cooking.onrender.com/api/auth/categories/${categoryId}/recipes/`
        );
        setRecipes(response.data);
      } catch (err) {
        setError("Failed to fetch recipes: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryRecipes();
  }, [categoryId]);

  const handleRecipeClick = (id) => {
    navigate(`/recipe/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-500 border-t-transparent mx-auto mb-4 shadow-lg"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-20 w-20 border-4 border-blue-200 border-t-transparent"></div>
          </div>
          <p className="text-slate-600 text-lg font-medium mt-4 animate-pulse">Loading delicious recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 animate-slide-down">
          <div className="relative inline-flex mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
            <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <span className="text-3xl text-white filter drop-shadow-lg">🍽️</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4 leading-tight">
            {recipes.length > 0
              ? `Recipes in "${recipes[0].categories?.[0]?.name || "Category"}"`
              : "No Recipes Found"}
          </h1>
          <p className="text-slate-600 text-xl max-w-3xl mx-auto leading-relaxed">
            {recipes.length > 0 
              ? `Discover ${recipes.length} culinary masterpieces crafted with passion`
              : "This category is waiting for its first delicious creation"}
          </p>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-12 animate-fade-in">
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-3xl p-8 text-center shadow-lg transform hover:scale-[1.02] transition-all duration-300">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-red-500">⚠️</span>
              </div>
              <p className="text-red-700 font-semibold text-lg">{error}</p>
            </div>
          </div>
        )}

        {/* Recipes Grid */}
        {recipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {recipes.map((recipe, index) => (
              <div
                key={recipe.id}
                onClick={() => handleRecipeClick(recipe.id)}
                className="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-white/20 cursor-pointer overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}
              >
                {/* Background Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Recipe Image */}
                {recipe.image && (
                  <div className="relative overflow-hidden rounded-t-3xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <img
                      src={
                        recipe.image.startsWith("http")
                          ? recipe.image
                          : `https://django-drf-ai-powered-recipe-cooking.onrender.com${recipe.image}`
                      }
                      alt={recipe.title}
                      className="w-full h-52 object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Image Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-16 z-20"></div>
                  </div>
                )}

                {/* Recipe Content */}
                <div className="relative z-30 p-7 bg-white/95 backdrop-blur-sm">
                  {/* Title */}
                  <h2 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
                    {recipe.title}
                  </h2>

                  {/* Description */}
                  <p className="text-slate-600 text-sm mb-5 line-clamp-3 leading-relaxed font-light">
                    {recipe.description}
                  </p>

                  {/* Meta Information */}
                  <div className="flex items-center justify-between text-sm pt-5 border-t border-slate-100/80">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                      <span className="font-semibold text-slate-700">{recipe.author}</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-slate-50/80 px-3 py-1.5 rounded-2xl backdrop-blur-sm">
                      <span className="text-xs text-slate-500">📅</span>
                      <span className="text-xs font-semibold text-slate-600">
                        {format(new Date(recipe.created_at), "MMM dd, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hover Border Effect */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-200/50 rounded-3xl transition-all duration-500 pointer-events-none"></div>
                
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          !error && (
            <div className="max-w-2xl mx-auto text-center animate-fade-in">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 border border-white/20 transform hover:scale-[1.02] transition-all duration-500">
                <div className="relative inline-flex mb-6">
                  <div className="absolute inset-0 bg-slate-100 rounded-full blur-xl"></div>
                  <div className="relative w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center shadow-inner">
                    <span className="text-5xl text-slate-400">🍳</span>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-slate-800 mb-4">No Recipes Yet</h3>
                <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                  This culinary category is waiting for its first masterpiece. 
                  Be the first to share your recipe creation!
                </p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-10 py-4 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0"
                >
                  Explore More Recipes
                </button>
              </div>
            </div>
          )
        )}

        {/* Footer Stats */}
        {recipes.length > 0 && (
          <div className="text-center mt-16 animate-fade-in-up">
            <div className="inline-flex items-center space-x-12 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg px-10 py-6 border border-white/20 transform hover:scale-[1.02] transition-all duration-300">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">{recipes.length}</div>
                <div className="text-sm text-slate-600 font-medium uppercase tracking-wider mt-2">Total Recipes</div>
              </div>
              <div className="w-px h-12 bg-gradient-to-b from-slate-200 to-slate-300"></div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                  {new Set(recipes.map(r => r.author)).size}
                </div>
                <div className="text-sm text-slate-600 font-medium uppercase tracking-wider mt-2">Unique Chefs</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add custom animations to CSS */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.6s ease-out;
        }
        .animate-fade-in {
          animation: fade-in-up 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CategoryRecipes;