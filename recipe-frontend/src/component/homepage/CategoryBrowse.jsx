import React from "react";
import { useNavigate } from "react-router-dom";

// Use environment variable with fallback
const API_BASE_URL = process.env.REACT_APP_API_URL || "https://django-drf-ai-powered-recipe-cooking.onrender.com";

const CategoryBrowse = ({ categories }) => {
  const navigate = useNavigate();

  const handleCategoryClick = (id) => {
    // Navigate to category recipes page
    navigate(`/category/${id}`);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return imagePath.startsWith("http") ? imagePath : `${API_BASE_URL}${imagePath}`;
  };

  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Browse by Category
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            Find your next culinary inspiration by exploring our recipe categories
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer flex flex-col items-center p-8 border border-gray-100 hover:border-orange-200"
            >
              <div className="relative w-28 h-28 mb-6 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-500 transform group-hover:scale-110">
                {cat.cat_image ? (
                  <img
                    src={getImageUrl(cat.cat_image)}
                    alt={cat.name}
                    className="relative w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <span className="text-4xl transform group-hover:scale-110 transition-transform duration-500">
                      {cat.icon || "🍽️"}
                    </span>
                  </div>
                )}
              </div>

              <h3 className="font-bold text-gray-900 text-lg text-center mb-2 group-hover:text-orange-600 transition-colors duration-300 relative z-10">
                {cat.name}
              </h3>

              <div className="flex items-center gap-2 text-sm text-gray-500 group-hover:text-orange-500 transition-colors duration-300 relative z-10">
                <span className="w-1 h-1 bg-current rounded-full opacity-60"></span>
                <span className="font-medium">{cat.recipes_count || 0} recipes</span>
              </div>

              <div className="absolute bottom-4 w-8 h-1 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transform group-hover:scale-110 transition-all duration-300"></div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
            View All Categories
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategoryBrowse;