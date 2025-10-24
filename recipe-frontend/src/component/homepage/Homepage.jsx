import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Hero from './Hero';
import FeaturedRecipes from './FeaturedRecipes';
import CategoryBrowse from './CategoryBrowse';
import RecipeGrid from './RecipeGrid';

// Use environment variable with fallback
const API_BASE = process.env.REACT_APP_API_URL || "https://django-drf-ai-powered-recipe-cooking.onrender.com/api/auth";

const Homepage = () => {
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allRecipes, setAllRecipes] = useState([]);
  const [error, setError] = useState('');

  // Fetch recipes and featured in one call
  useEffect(() => {
    axios.get(`${API_BASE}/recipes/`)
      .then(res => {
        let recipes = [];
        // Handle paginated or plain array
        if (Array.isArray(res.data)) {
          recipes = res.data;
        } else if (Array.isArray(res.data.results)) {
          recipes = res.data.results;
        }

        setFeaturedRecipes(recipes.filter(r => r.featured));
        setAllRecipes(recipes);
      })
      .catch(err => setError('Failed to load recipes: ' + err.message));
  }, []);

  // Fetch categories
  useEffect(() => {
    axios.get(`${API_BASE}/categories/`)
      .then(res => setCategories(res.data))
      .catch(err => setError('Failed to load categories: ' + err.message));
  }, []);

  return (
    <div>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <Hero />
      <FeaturedRecipes recipes={featuredRecipes} />
      <CategoryBrowse categories={categories} />
      <RecipeGrid recipes={allRecipes} title="All Recipes" />
    </div>
  );
};

export default Homepage;