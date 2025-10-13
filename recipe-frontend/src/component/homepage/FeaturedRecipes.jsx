// src/component/homepage/FeaturedRecipes.jsx
import React, { useState } from 'react';

const FeaturedRecipes = ({ recipes }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!recipes || recipes.length === 0) return null;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === recipes.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? recipes.length - 1 : prev - 1));
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
            Featured Recipes
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover culinary excellence with our handpicked selection of standout recipes
          </p>
        </div>

        {/* Modern Carousel Container */}
        <div className="relative group">
          {/* Progress Indicators */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              {recipes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'bg-amber-600 w-6' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Carousel Content */}
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {recipes.map((recipe) => (
                <div key={recipe.id} className="w-full flex-shrink-0">
                  <div className="md:flex">
                    {/* Image Section - Fixed Height Container */}
                    <div className="md:w-1/2 relative">
                      <div className="aspect-[4/3] md:aspect-square overflow-hidden">
                        <img
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                          src={recipe.image}
                          alt={recipe.title}
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTMwTDE1MCAyMjBIMjUwTDIwMCAxMzBaIiBmaWxsPSIjRDREOERDIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjI4MCIgcj0iMzAiIGZpbGw9IiNENERCOEMiLz4KPC9zdmc+';
                          }}
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>

                    {/* Content Section - Fixed Height to Match Image */}
                    <div className="p-8 md:w-1/2 flex flex-col justify-center bg-white">
                      <div className="max-w-md mx-auto w-full">
                        {/* Category Badge */}
                        <span className="inline-block px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-100 rounded-full mb-4">
                          Featured
                        </span>
                        
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight line-clamp-2">
                          {recipe.title}
                        </h3>
                        
                        <p className="text-gray-600 mb-6 text-base md:text-lg leading-relaxed line-clamp-3">
                          {recipe.description}
                        </p>

                        {/* Author & Date */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-gray-100 gap-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-sm font-bold">
                                {recipe.author?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                By {recipe.author || 'Unknown Chef'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {recipe.created_at ? new Date(recipe.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                }) : 'Recently added'}
                              </p>
                            </div>
                          </div>
                          
                          {/* View Recipe Button */}
                          <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap">
                            View Recipe
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Navigation Buttons */}
            <button
              onClick={prevSlide}
              className="absolute left-4 md:left-6 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 md:p-4 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:shadow-xl group/btn"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-700 group-hover/btn:text-amber-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-4 md:right-6 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 md:p-4 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:shadow-xl group/btn"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-700 group-hover/btn:text-amber-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedRecipes;