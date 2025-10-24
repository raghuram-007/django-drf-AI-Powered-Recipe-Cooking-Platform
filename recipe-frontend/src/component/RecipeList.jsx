import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const API_BASE = `${process.env.REACT_APP_API_URL}/api/auth`;

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE}/categories/`);
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Could not load categories");
      }
    };
    fetchCategories();
  }, []);

  // Fetch recipes with filters
  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE}/recipes/`, {
          params: {
            search: search || undefined,
            categories__id: selectedCategory || undefined,
            featured: featuredOnly || undefined, 
            page: page,
          },
        });

        const data = response.data;

        if (Array.isArray(data)) {
          setRecipes(data);
          setTotalPages(1);
        } else if (Array.isArray(data.results)) {
          setRecipes(data.results);
          setTotalPages(Math.ceil(data.count / 5) || 1);
        } else {
          setRecipes([]);
          setTotalPages(1);
        }
      } catch (error) {
        setError("Failed to fetch recipes: " + error.message);
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, [search, selectedCategory, page, featuredOnly]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FF6B35] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading delicious recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-r from-[#FF6B35]/10 to-[#E55A2B]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-r from-[#FF6B35]/5 to-[#E55A2B]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/20 mb-6">
            <div className="w-2 h-2 bg-[#FF6B35] rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-600">Discover Amazing Recipes</span>
          </div>

          <h1 className="text-5xl lg:text-6xl font-black mb-6 bg-gradient-to-r from-gray-900 via-[#FF6B35] to-[#E55A2B] bg-clip-text text-transparent leading-tight">
            Culinary Collection
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our handpicked selection of delicious recipes crafted with love and expertise
          </p>
        </div>

        {error && (
          <div className="mb-8 p-6 bg-red-50/80 backdrop-blur-sm rounded-2xl shadow-lg border border-red-200 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Search Bar */}
        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search recipes by name, ingredients, or description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-12 pr-4 py-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all duration-300 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex justify-center gap-3 mb-12 flex-wrap">
          <button
            onClick={() => {
              setSelectedCategory("");
              setPage(1);
            }}
            className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${selectedCategory === ""
                ? "bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] text-white shadow-lg shadow-[#FF6B35]/25"
                : "bg-white/90 backdrop-blur-sm text-gray-700 shadow-lg border border-white/20 hover:border-[#FF6B35]/30"
              }`}
          >
            All Recipes
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setPage(1);
              }}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${selectedCategory === cat.id
                  ? "bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] text-white shadow-lg shadow-[#FF6B35]/25"
                  : "bg-white/90 backdrop-blur-sm text-gray-700 shadow-lg border border-white/20 hover:border-[#FF6B35]/30"
                }`}
            >
              {cat.name}
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${selectedCategory === cat.id ? "bg-white/20" : "bg-gray-100"
                }`}>
                {cat.recipes_count || 0}
              </span>
            </button>
          ))}
          <button
  onClick={() => {
    setFeaturedOnly(!featuredOnly);
    setPage(1);
  }}
  className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
    featuredOnly
      ? "bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] text-white shadow-lg shadow-[#FF6B35]/25"
      : "bg-white/90 backdrop-blur-sm text-gray-700 shadow-lg border border-white/20 hover:border-[#FF6B35]/30"
  }`}
>
 Popular Recipes
</button>

        </div>
        

        {/* Recipes Grid */}
        {recipes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">No Recipes Found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
            {recipes.map((recipe, index) => (
              <Link
                key={recipe.id}
                to={`/recipe/${recipe.id}`}
                className="block group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Fixed Height Card Container */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group-hover:scale-105 flex flex-col h-[480px]"> {/* Fixed height */}

                  {/* Recipe Image - Fixed Height */}
                  <div className="relative h-48 flex-shrink-0 overflow-hidden"> {/* Fixed image height */}
                    {recipe.image ? (
                      <img
                        src={
                          recipe.image.startsWith("http")
                            ? recipe.image
                            : `http://127.0.0.1:8000${recipe.image}`
                        }
                        alt={recipe.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-[#FF6B35]" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm font-bold text-gray-700">
                            {recipe.ratings?.length > 0
                              ? (recipe.ratings.reduce((acc, curr) => acc + curr.stars, 0) / recipe.ratings.length).toFixed(1)
                              : "0.0"
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recipe Content - Flexible Height */}
                  <div className="p-6 flex flex-col flex-1"> {/* Takes remaining space */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#FF6B35] transition-colors duration-300">
                      {recipe.title}
                    </h3>

                    <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed flex-1"> {/* Flexible description */}
                      {recipe.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#FF6B35] rounded-full"></div>
                        <span className="font-medium">By {recipe.author}</span>
                      </div>
                      <span>{format(new Date(recipe.created_at), "MMM dd, yyyy")}</span>
                    </div>

                    {/* Recipe Meta - Fixed at bottom */}
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-100 mt-auto"> {/* Pushes to bottom */}
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{recipe.prep_time + recipe.cook_time} min</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>{recipe.servings} servings</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && page <= totalPages && (
          <div className="flex justify-center items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Page Numbers */}
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                disabled={i + 1 > totalPages} // prevent going past available pages
                className={`px-4 py-2 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-110 ${page === i + 1
                    ? "bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] text-white shadow-lg shadow-[#FF6B35]/25"
                    : "bg-white/90 backdrop-blur-sm text-gray-700 shadow-lg border border-white/20 hover:border-[#FF6B35]/30"
                  }`}
              >
                {i + 1}
              </button>
            ))}

            {/* Next Button */}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default RecipeList;