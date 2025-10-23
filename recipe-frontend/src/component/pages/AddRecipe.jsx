import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


const AddRecipe = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ingredients: "",
    instruction: "",
    prep_time: "",
    cook_time: "",
    servings: "",
    difficulty: "Easy",
    featured: false,
    categories: [],
    calories: "",
    protein: "",
    fat: "",
    carbs: "",
  });

  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [categoriesList, setCategoriesList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // === AI GENERATION STATES (NEW) ===
  const [aiDescription, setAiDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  // === END AI STATES ===

  // Fetch categories from backend (EXISTING - UNCHANGED)
  useEffect(() => {
    axios
      .get("https://django-drf-ai-powered-recipe-cooking.onrender.com/api/auth/categories/")
      .then((res) => setCategoriesList(res.data))
      .catch((err) => console.error(err));
  }, []);

  // === AI GENERATION FUNCTION (NEW) ===
  const generateAIRecipe = async () => {
    if (!aiDescription.trim()) {
      alert("Please describe what recipe you want to generate");
      return;
    }

    setIsGenerating(true);
    try {
      const token = localStorage.getItem("access");
      const response = await axios.post(
        "https://django-drf-ai-powered-recipe-cooking.onrender.com/api/auth/ai/generate-structured-recipe/",
        { description: aiDescription },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const aiRecipe = response.data.recipe_data;
        
        // Auto-fill the form with AI-generated content
        setFormData({
          ...formData,
          title: aiRecipe.title || "",
          description: aiRecipe.description || "",
          ingredients: Array.isArray(aiRecipe.ingredients) 
            ? aiRecipe.ingredients.join('\n') 
            : aiRecipe.ingredients || "",
          instruction: Array.isArray(aiRecipe.instructions) 
            ? aiRecipe.instructions.join('\n') 
            : aiRecipe.instructions || "",
          prep_time: aiRecipe.prep_time || "",
          cook_time: aiRecipe.cook_time || "",
          servings: aiRecipe.servings || "",
          difficulty: aiRecipe.difficulty || "Medium",
        });

        setShowAIPrompt(false);
        setAiDescription(""); // Clear the AI input
        toast.success("Recipe generated successfully! Review and edit before saving.");

      }
    } catch (error) {
      console.error("AI Generation failed:", error);
      toast.error("Failed to generate recipe. Please try again.");

    } finally {
      setIsGenerating(false);
    }
  };
  // === END AI FUNCTION ===

  // === EXISTING HANDLERS (ALL UNCHANGED) ===
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    if (e.target.name === "image") setImage(e.target.files[0]);
    if (e.target.name === "video") setVideo(e.target.files[0]);
  };

  const handleCategoryChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) selected.push(options[i].value);
    }
    setFormData({ ...formData, categories: selected });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access");
    if (!token) {
      toast.warning("You must logged in to add recipe.. ")
      return;
    }

    setIsSubmitting(true);
    const data = new FormData();

    // Normal fields
    Object.keys(formData).forEach((key) => {
      if (key === "categories") {
        formData.categories.forEach((cat) => data.append("categories", cat));
      } else if (!["calories", "protein", "fat", "carbs"].includes(key)) {
        if (formData[key] !== "") data.append(key, formData[key]);
      }
    });

    // Nutrient fields (send directly)
    ["calories", "protein", "fat", "carbs"].forEach((field) => {
      if (formData[field] !== "") data.append(field, formData[field]);
    });

    if (image) data.append("image", image);
    if (video) data.append("video", video);

    try {
      await axios.post(
        "https://django-drf-ai-powered-recipe-cooking.onrender.com/api/auth/recipes/",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Recipe added successfully!");

      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Failed To add Recipe...")
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section with AI Button (MODIFIED) */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Create New Recipe</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Share your culinary masterpiece with the world. Fill in the details below to add your recipe.
          </p>
          
          {/* AI Generator Button (NEW) */}
          <button
            type="button"
            onClick={() => setShowAIPrompt(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 mb-4"
          >
            🧠 Generate with AI
          </button>
          <p className="text-sm text-gray-500">
            Or fill out the form manually below
          </p>
        </div>

        {/* AI Prompt Modal (NEW) */}
        {showAIPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-slide-up">
              <h3 className="text-xl font-bold text-gray-800 mb-4">AI Recipe Generator</h3>
              <p className="text-gray-600 mb-4">Describe the recipe you want to create:</p>
              
              <textarea
                value={aiDescription}
                onChange={(e) => setAiDescription(e.target.value)}
                placeholder="e.g., 'gluten-free chocolate cake with vanilla frosting' or 'quick 30-minute chicken stir fry'"
                className="w-full h-32 p-3 border border-gray-300 rounded-lg mb-4 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isGenerating}
              />
              
              <div className="flex gap-3">
                <button
                  onClick={generateAIRecipe}
                  disabled={isGenerating || !aiDescription.trim()}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg disabled:bg-gray-400 hover:bg-blue-700 transition-colors"
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    "Generate Recipe"
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowAIPrompt(false);
                    setAiDescription("");
                  }}
                  disabled={isGenerating}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Form Card (EXISTING - UNCHANGED) */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Basic Information Section */}
            <div className="space-y-6 animate-slide-up">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
                {/* AI Generated Badge (NEW) */}
                {formData.title && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                    ✨ AI Generated
                  </span>
                )}
              </div>
              
              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipe Title</label>
                  <input 
                    type="text" 
                    name="title" 
                    placeholder="Enter recipe title..." 
                    value={formData.title} 
                    onChange={handleChange} 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea 
                    name="description" 
                    placeholder="Describe your recipe..." 
                    value={formData.description} 
                    onChange={handleChange} 
                    required 
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Ingredients & Instructions Section */}
            <div className="grid md:grid-cols-2 gap-8 animate-slide-up" style={{animationDelay: "0.1s"}}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients</label>
                <textarea 
                  name="ingredients" 
                  placeholder="Enter ingredients (one per line or comma separated)..." 
                  value={formData.ingredients} 
                  onChange={handleChange} 
                  required 
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                <textarea 
                  name="instruction" 
                  placeholder="Enter step-by-step instructions..." 
                  value={formData.instruction} 
                  onChange={handleChange} 
                  required 
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none"
                />
              </div>
            </div>

            {/* === REST OF YOUR EXISTING FORM - COMPLETELY UNCHANGED === */}
            {/* Recipe Details Section */}
            <div className="space-y-6 animate-slide-up" style={{animationDelay: "0.2s"}}>
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Recipe Details</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prep Time (min)</label>
                  <input 
                    type="number" 
                    name="prep_time" 
                    placeholder="e.g., 15" 
                    value={formData.prep_time} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cook Time (min)</label>
                  <input 
                    type="number" 
                    name="cook_time" 
                    placeholder="e.g., 30" 
                    value={formData.cook_time} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Servings</label>
                  <input 
                    type="number" 
                    name="servings" 
                    placeholder="e.g., 4" 
                    value={formData.servings} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                  <select 
                    name="difficulty" 
                    value={formData.difficulty} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="flex items-center justify-center">
                  <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-xl hover:border-gray-400 transition-all duration-200 cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="featured" 
                      checked={formData.featured} 
                      onChange={handleChange} 
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    /> 
                    <span className="text-lg font-medium text-gray-700">Featured Recipe</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Categories Section */}
            <div className="animate-slide-up" style={{animationDelay: "0.3s"}}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
              <select 
                multiple 
                value={formData.categories} 
                onChange={handleCategoryChange} 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 h-32"
              >
                {categoriesList.map((cat) => (
                  <option key={cat.id} value={cat.id} className="px-4 py-2 hover:bg-blue-50 cursor-pointer">
                    {cat.name}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-2">Hold Ctrl/Cmd to select multiple categories</p>
            </div>

            {/* Media Upload Section */}
            <div className="grid md:grid-cols-2 gap-6 animate-slide-up" style={{animationDelay: "0.4s"}}>
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-300">
                <label className="block text-lg font-medium text-gray-700 mb-3">Recipe Image</label>
                <input 
                  type="file" 
                  name="image" 
                  onChange={handleFileChange} 
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-sm text-gray-500 mt-2">Upload a high-quality image of your dish</p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-green-400 hover:bg-green-50 transition-all duration-300">
                <label className="block text-lg font-medium text-gray-700 mb-3">Cooking Video</label>
                <input 
                  type="file" 
                  name="video" 
                  onChange={handleFileChange} 
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                <p className="text-sm text-gray-500 mt-2">Optional: Upload a cooking tutorial video</p>
              </div>
            </div>

            {/* Nutrition Information Section */}
            <div className="animate-slide-up" style={{animationDelay: "0.5s"}}>
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Nutrition Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl hover:shadow-md transition-all duration-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Calories</label>
                  <input 
                    type="number" 
                    name="calories" 
                    placeholder="Cal" 
                    value={formData.calories} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl hover:shadow-md transition-all duration-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Protein (g)</label>
                  <input 
                    type="number" 
                    name="protein" 
                    placeholder="g" 
                    value={formData.protein} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl hover:shadow-md transition-all duration-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fat (g)</label>
                  <input 
                    type="number" 
                    name="fat" 
                    placeholder="g" 
                    value={formData.fat} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl hover:shadow-md transition-all duration-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Carbs (g)</label>
                  <input 
                    type="number" 
                    name="carbs" 
                    placeholder="g" 
                    value={formData.carbs} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="animate-slide-up" style={{animationDelay: "0.6s"}}>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Recipe...
                  </span>
                ) : (
                  "Create Recipe"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Add custom animations to your global CSS */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.6s ease-out both; }
      `}</style>
    </div>
  );
};

export default AddRecipe;