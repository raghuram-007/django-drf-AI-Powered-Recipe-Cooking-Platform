import React, { useState } from 'react';
import axios from 'axios';

const AICookingCoach = ({ recipe }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const askCookingCoach = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('access');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/ai/cooking-coach/`,
        {
          question: question,
          recipe_context: recipe?.title || '',
          cooking_step: 'General cooking help'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setAnswer(response.data.answer);
      }
    } catch (error) {
      console.error('Cooking coach error:', error);
      setAnswer('Sorry, the cooking coach is unavailable right now. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        🧑‍🍳 AI Cooking Coach
      </h3>

      <p className="text-gray-600 mb-4">
        Stuck while cooking? Ask for help with techniques, troubleshooting, or tips!
      </p>

      <div className="space-y-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., How do I know when the pasta is al dente?"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={askCookingCoach}
            disabled={isLoading || !question.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {isLoading ? 'Asking...' : 'Ask Coach'}
          </button>
        </div>

        {answer && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 animate-slide-up">
            <h4 className="font-semibold text-blue-800 mb-2">Coach's Answer:</h4>
            <div className="text-gray-700 whitespace-pre-wrap">
              {answer}
            </div>
          </div>
        )}
      </div>

      {/* Example questions */}
      <div className="mt-4">
        <p className="text-sm text-gray-500 mb-2">Try asking:</p>
        <div className="flex flex-wrap gap-2">
          {[
            "How do I know when this is cooked properly?",
            "What can I substitute for [ingredient]?",
            "My sauce is too thin, how to fix it?",
            "How to make this recipe healthier?"
          ].map((example, index) => (
            <button
              key={index}
              onClick={() => setQuestion(example)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AICookingCoach;
