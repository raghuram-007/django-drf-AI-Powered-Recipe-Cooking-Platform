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

  // === AI GENERATION STATES ===
  const [aiDescription, setAiDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  // === END AI STATES ===

  // Fetch categories from backend
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/auth/categories/`)
      .then((res) => setCategoriesList(res.data))
      .catch((err) => console.error(err));
  }, []);

  // AI Generation Function
  const generateAIRecipe = async () => {
    if (!aiDescription.trim()) {
      alert("Please describe what recipe you want to generate");
      return;
    }

    setIsGenerating(true);
    try {
      const token = localStorage.getItem("access");
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/ai/generate-structured-recipe/`,
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

        setFormData({
          ...formData,
          title: aiRecipe.title || "",
          description: aiRecipe.description || "",
          ingredients: Array.isArray(aiRecipe.ingredients)
            ? aiRecipe.ingredients.join("\n")
            : aiRecipe.ingredients || "",
          instruction: Array.isArray(aiRecipe.instructions)
            ? aiRecipe.instructions.join("\n")
            : aiRecipe.instructions || "",
          prep_time: aiRecipe.prep_time || "",
          cook_time: aiRecipe.cook_time || "",
          servings: aiRecipe.servings || "",
          difficulty: aiRecipe.difficulty || "Medium",
        });

        setShowAIPrompt(false);
        setAiDescription("");
        toast.success("Recipe generated successfully! Review and edit before saving.");
      }
    } catch (error) {
      console.error("AI Generation failed:", error);
      toast.error("Failed to generate recipe. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Form Handlers
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
      toast.warning("You must be logged in to add a recipe.");
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

    // Nutrient fields
    ["calories", "protein", "fat", "carbs"].forEach((field) => {
      if (formData[field] !== "") data.append(field, formData[field]);
    });

    if (image) data.append("image", image);
    if (video) data.append("video", video);

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/recipes/`,
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
      toast.error("Failed to add recipe.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section with AI Button */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Create New Recipe</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Share your culinary masterpiece with the world. Fill in the details below to add your recipe.
          </p>

          <button
            type="button"
            onClick={() => setShowAIPrompt(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 mb-4"
          >
            🧠 Generate with AI
          </button>
          <p className="text-sm text-gray-500">Or fill out the form manually below</p>
        </div>

        {/* AI Prompt Modal */}
        {showAIPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-slide-up">
              <h3 className="text-xl font-bold text-gray-800 mb-4">AI Recipe Generator</h3>
              <p className="text-gray-600 mb-4">Describe the recipe you want to create:</p>

              <textarea
                value={aiDescription}
                onChange={(e) => setAiDescription(e.target.value)}
                placeholder="e.g., 'gluten-free chocolate cake with vanilla frosting'"
                className="w-full h-32 p-3 border border-gray-300 rounded-lg mb-4 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isGenerating}
              />

              <div className="flex gap-3">
                <button
                  onClick={generateAIRecipe}
                  disabled={isGenerating || !aiDescription.trim()}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg disabled:bg-gray-400 hover:bg-blue-700 transition-colors"
                >
                  {isGenerating ? "Generating..." : "Generate Recipe"}
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

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-6 animate-slide-up">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
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
            <div className="grid md:grid-cols-2 gap-8 animate-slide-up">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients</label>
                <textarea
                  name="ingredients"
                  placeholder="Enter ingredients..."
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

            {/* Recipe Details, Categories, Media, Nutrition, Submit - unchanged except API fix */}
            {/* ...rest of your form stays the same */}
          </form>
        </div>
      </div>

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
