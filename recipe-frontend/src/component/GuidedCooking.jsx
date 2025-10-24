// src/components/GuidedCooking.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AICookingCoach from './AICookingCoach';

const GuidedCooking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { originalRecipe, guidedInstructions } = location.state || {};
  const [currentStepIndex, setCurrentStepIndex] = useState(0); // Track current step

  if (!originalRecipe) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">No Recipe Selected</h2>
          <button 
            onClick={() => navigate('/discover')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Discover
          </button>
        </div>
      </div>
    );
  }

  // Split enhanced guide into steps safely
  const steps = guidedInstructions?.enhanced_guide
    ? guidedInstructions.enhanced_guide.split(/\r?\n|\.\s+/).filter(s => s.trim() !== '')
    : [`Starting cooking guide for ${originalRecipe.title || 'this recipe'}. Follow the instructions carefully.`];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <button 
            onClick={() => navigate('/discover')}
            className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2 transition-colors"
          >
            <span>←</span>
            Back to Trending Recipes
          </button>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{originalRecipe.title || 'Untitled Recipe'}</h1>
          <p className="text-gray-600 mb-4">{originalRecipe.description || ''}</p>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span>⏱️ {(originalRecipe.prep_time || 0) + (originalRecipe.cook_time || 0)} min</span>
            <span>📊 {originalRecipe.difficulty || 'N/A'}</span>
            <span>👥 {originalRecipe.servings || 4} servings</span>
          </div>
        </div>

        {/* AI Cooking Coach */}
        <div className="mb-6">
          <AICookingCoach recipe={originalRecipe} />
        </div>

        {/* Guided Instructions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>🧭</span>
            AI Cooking Guide
          </h2>
          
          {guidedInstructions ? (
            <div className="prose max-w-none">
              {steps.map((step, idx) => (
                <p
                  key={idx}
                  className={`text-gray-700 leading-relaxed text-sm sm:text-base ${
                    idx === currentStepIndex ? 'bg-yellow-100 px-2 rounded' : ''
                  }`}
                >
                  {step}
                </p>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Generating AI cooking guide...</p>
            </div>
          )}
        </div>

        {/* Key Ingredients */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>🛒</span>
            Key Ingredients
          </h3>
          <div className="flex flex-wrap gap-2">
            {(originalRecipe.key_ingredients || []).map((ingredient, idx) => (
              <span 
                key={idx} 
                className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm border border-gray-200"
              >
                {ingredient}
              </span>
            ))}
          </div>
        </div>

        {/* Viral Tips */}
        {(originalRecipe.viral_tips || []).length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-yellow-800 mb-3 flex items-center gap-2">
              <span>🔥</span>
              Viral Tips
            </h3>
            <ul className="space-y-2">
              {originalRecipe.viral_tips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-yellow-500 mr-2 mt-1">•</span>
                  <span className="text-yellow-700">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuidedCooking;
