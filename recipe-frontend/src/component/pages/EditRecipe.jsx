import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios.js';

const EditRecipe = () => {
  const { id } = useParams(); // recipe ID from URL
  const navigate = useNavigate();

  const [recipeData, setRecipeData] = useState({
    title: '',
    description: '',
    ingredients: '',
    instruction: '',
    image: '',
    categories: [],   // for PATCH
    featured: false,  // for PATCH
    video: '',        // optional
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch recipe data
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await axiosInstance.get(`/user-recipes/${id}/`);
        setRecipeData({
          title: res.data.title || '',
          description: res.data.description || '',
          ingredients: res.data.ingredients || '',
          instruction: res.data.instruction || '',
          image: res.data.image || '',
          categories: res.data.categories || [],
          featured: res.data.featured || false,
          video: '', // always reset video input to empty (user can upload new)
        });
      } catch (err) {
        console.error('Failed to fetch recipe:', err);
        alert('Failed to fetch recipe data.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;

    if ((name === 'image' || name === 'video') && files.length > 0) {
      setRecipeData({ ...recipeData, [name]: files[0] });
    } else if (type === 'checkbox') {
      setRecipeData({ ...recipeData, [name]: checked });
    } else {
      setRecipeData({ ...recipeData, [name]: value });
    }
  };

  // Handle submit (PATCH)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('title', recipeData.title);
      formData.append('description', recipeData.description);
      formData.append('ingredients', recipeData.ingredients);
      formData.append('instruction', recipeData.instruction);
      formData.append('featured', recipeData.featured);

      // Only append video if it's a File object
      if (recipeData.video instanceof File) {
        formData.append('video', recipeData.video);
      }

      // Append categories if any
      if (recipeData.categories.length) {
        recipeData.categories.forEach((cat) => formData.append('categories', cat));
      }

      // Only append image if it's a File object
      if (recipeData.image instanceof File) {
        formData.append('image', recipeData.image);
      }

      await axiosInstance.patch(`/user-recipes/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Recipe updated successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to update recipe:', err.response?.data || err);
      alert('Failed to update recipe. Check console for details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading recipe data...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 fade-in">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Edit Recipe</h1>
          <p className="text-gray-600">Update your recipe details below</p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Title */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Recipe Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={recipeData.title}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-gray-400"
                    required
                    placeholder="Enter recipe title"
                  />
                </div>

                {/* Description */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={recipeData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-gray-400 resize-none"
                    required
                    placeholder="Describe your recipe..."
                  />
                </div>

                {/* Ingredients */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Ingredients
                  </label>
                  <textarea
                    name="ingredients"
                    value={recipeData.ingredients}
                    onChange={handleChange}
                    rows="6"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-gray-400 resize-none font-mono text-sm"
                    required
                    placeholder="List ingredients (one per line or comma separated)"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Instructions */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Instructions
                  </label>
                  <textarea
                    name="instruction"
                    value={recipeData.instruction}
                    onChange={handleChange}
                    rows="6"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-gray-400 resize-none"
                    required
                    placeholder="Step-by-step instructions..."
                  />
                </div>

                {/* Image Upload */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Recipe Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 transition-all duration-200 group-hover:border-blue-400 group-hover:bg-blue-50">
                    <input 
                      type="file" 
                      name="image" 
                      accept="image/*" 
                      onChange={handleChange}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all duration-200"
                    />
                    {recipeData.image && !(recipeData.image instanceof File) && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">Current Image:</p>
                        <img
                          src={recipeData.image}
                          alt="Current recipe"
                          className="w-32 h-32 object-cover rounded-lg shadow-md transition-transform duration-200 hover:scale-105"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Video Upload */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Video (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 transition-all duration-200 group-hover:border-green-400 group-hover:bg-green-50">
                    <input 
                      type="file" 
                      name="video" 
                      accept="video/*" 
                      onChange={handleChange}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Featured Checkbox */}
                <div className="group flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 hover:bg-blue-50 hover:border-blue-200">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={recipeData.featured}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 transition-all duration-200"
                  />
                  <label className="text-sm font-semibold text-gray-700 cursor-pointer">
                    Feature this recipe
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end items-center mt-8 pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
              >
                {saving ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Updating Recipe...
                  </span>
                ) : (
                  'Update Recipe'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="text-center mt-6 fade-in">
          <p className="text-sm text-gray-500">
            Make your changes and click "Update Recipe" to save
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditRecipe;