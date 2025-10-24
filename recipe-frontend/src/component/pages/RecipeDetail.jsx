// src/component/pages/RecipeDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import ShareRecipe from "../../component/ShareRecipe";
import AICookingCoach from "../../component/AICookingCoach";

// FollowButton Component - Updated to match your backend API
const FollowButton = ({ targetUserId, targetUsername, initialIsFollowing = false }) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("access");
  const config = {
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  };

  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  const handleFollowToggle = async () => {
    if (loading || !token) return;
    
    setLoading(true);
    try {
      if (isFollowing) {
        // Unfollow - using your actual backend endpoint
        await axios.post(`${process.env.REACT_APP_API_URL || "https://django-drf-ai-powered-recipe-cooking.onrender.com"}/api/auth/follows/unfollow/`, { user_id: targetUserId }, config);
        setIsFollowing(false);
      } else {
        // Follow - using your actual backend endpoint
        await axios.post(`${process.env.REACT_APP_API_URL || "https://django-drf-ai-powered-recipe-cooking.onrender.com"}/api/auth/follows/follow/`, { user_id: targetUserId }, config);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert('Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null; // Don't show follow button if user is not logged in

  return (
    <button
      onClick={handleFollowToggle}
      disabled={loading}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
        isFollowing
          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300'
          : 'bg-blue-500 text-white hover:bg-blue-600 border border-blue-500'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {loading ? '...' : isFollowing ? '✅ Following' : '➕ Follow'}
    </button>
  );
};

// Use environment variable with fallback
const API_BASE = process.env.REACT_APP_API_URL || "https://django-drf-ai-powered-recipe-cooking.onrender.com/api/auth";

const RecipeDetail = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [animateElements, setAnimateElements] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const token = localStorage.getItem("access");
  const config = {
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  };

  // Calculate rating distribution from backend data
  const calculateRatingDistribution = (ratings) => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    if (ratings && ratings.length > 0) {
      ratings.forEach(rating => {
        if (rating.stars >= 1 && rating.stars <= 5) {
          distribution[rating.stars]++;
        }
      });
    }
    
    return distribution;
  };

  // Calculate average rating and total ratings
  const calculateRatingStats = (ratings) => {
    if (!ratings || ratings.length === 0) {
      return { averageRating: 0, totalRatings: 0 };
    }
    
    const totalRatings = ratings.length;
    const sum = ratings.reduce((acc, curr) => acc + curr.stars, 0);
    const averageRating = sum / totalRatings;
    
    return { averageRating, totalRatings };
  };

  // Fetch recipe
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await axios.get(`${API_BASE}/recipes/${id}/`, config);
        const recipeData = res.data;
        setRecipe(recipeData);
        
        // Check if user has already rated this recipe
        if (recipeData.ratings && token) {
          const currentUser = localStorage.getItem("user_email");
          if (currentUser) {
            const userRatingObj = recipeData.ratings.find(r => r.user === currentUser);
            if (userRatingObj) {
              setUserRating(userRatingObj.stars);
              setRating(userRatingObj.stars);
            }
          }
        }

        // Set current user ID (you might need to adjust this based on your auth system)
        setCurrentUserId(localStorage.getItem("user_id"));
        
        setLoading(false);
        // Trigger animations after data loads
        setTimeout(() => setAnimateElements(true), 100);
      } catch (err) {
        console.error(err);
        setError("Failed to load recipe. Please login.");
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  // Favorite toggle
  const handleFavorite = async () => {
    try {
      const url = recipe.is_favorite
        ? `${API_BASE}/recipes/${id}/remove_favorite/`
        : `${API_BASE}/recipes/${id}/add_favorite/`;
      await axios.post(url, {}, config);
      setRecipe({ ...recipe, is_favorite: !recipe.is_favorite });
    } catch (err) {
      console.log(err);
    }
  };

  // Rating submit
  const handleRating = async () => {
    if (!token) {
      alert("Please login to rate this recipe");
      return;
    }
    
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    try {
      await axios.post(`${API_BASE}/recipes/${id}/add_rating/`, { stars: rating }, config);
      
      const updatedRecipe = { ...recipe };
      const currentUser = localStorage.getItem("user_email");
      const existingRatingIndex = updatedRecipe.ratings.findIndex(r => r.user === currentUser);
      if (existingRatingIndex !== -1) {
        updatedRecipe.ratings[existingRatingIndex].stars = rating;
      } else {
        updatedRecipe.ratings.push({
          id: Date.now(),
          user: currentUser,
          stars: rating
        });
      }
      
      setRecipe(updatedRecipe);
      setUserRating(rating);
      alert("Rating submitted successfully!");
    } catch (err) {
      console.log(err);
      if (err.response?.status === 401) {
        alert("Please login to rate this recipe");
      } else {
        alert("Failed to submit rating. Please try again.");
      }
    }
  };

  // Comment submit
  const handleComment = async () => {
    try {
      const res = await axios.post(
        `${API_BASE}/recipes/${id}/add_comment/`,
        { content: comment },
        config
      );
      setRecipe({ ...recipe, comments: [...recipe.comments, res.data] });
      setComment("");
    } catch (err) {
      console.log(err);
    }
  };

  // Reply submit
  const handleReply = async (parentId) => {
    if (!replyContent.trim()) return;
    
    try {
      const res = await axios.post(
        `${API_BASE}/recipes/${id}/add_comment/`,
        { 
          content: replyContent,
          parent: parentId 
        },
        config
      );
      
      // Update the comments in state
      const updatedComments = recipe.comments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), res.data],
            has_replies: true
          };
        }
        return comment;
      });
      
      setRecipe({ ...recipe, comments: updatedComments });
      setReplyContent("");
      setReplyingTo(null);
    } catch (err) {
      console.error("Failed to post reply:", err);
      alert("Failed to post reply. Please try again.");
    }
  };

  // Handle comment deletion
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    
    try {
      await axios.delete(
        `${API_BASE}/recipes/${id}/delete_comment/`,
        {
          data: { comment_id: commentId },
          ...config
        }
      );
      
      // Remove comment from state
      const updatedComments = recipe.comments.filter(comment => 
        comment.id !== commentId && !comment.replies?.some(reply => reply.id === commentId)
      ).map(comment => ({
        ...comment,
        replies: comment.replies?.filter(reply => reply.id !== commentId) || []
      }));
      
      setRecipe({ ...recipe, comments: updatedComments });
    } catch (err) {
      console.error("Failed to delete comment:", err);
      alert("Failed to delete comment. Please try again.");
    }
  };

  // Toggle ingredient checkbox
  const toggleIngredient = (index) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Recursive component for rendering comments and replies
  const CommentItem = ({ comment, depth = 0 }) => {
    const currentUser = localStorage.getItem("user_email");
    const isAuthor = comment.user === currentUser;
    const maxDepth = 2; // Limit nesting depth
    
    return (
      <div className={`${depth > 0 ? 'ml-12 border-l-2 border-gray-200 pl-6' : ''}`}>
        <div className="p-6 rounded-2xl bg-gradient-to-r from-white to-gray-50 hover:from-[#FF6B35]/5 hover:to-[#FF6B35]/10 border border-gray-200 hover:border-[#FF6B35]/20 transition-all duration-500 transform hover:-translate-y-1 hover:shadow-lg mb-4">
          {/* Comment Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg">
                {comment.user.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-900">{comment.user}</p>
                <p className="text-sm text-gray-500">
                  {comment.created_at ? new Date(comment.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Recently'}
                  {comment.updated_at !== comment.created_at && ' (edited)'}
                </p>
              </div>
            </div>
            
            {/* Comment Actions */}
            {isAuthor && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingComment(comment.id);
                    setEditContent(comment.content);
                  }}
                  className="p-2 text-gray-500 hover:text-[#FF6B35] transition-colors duration-300"
                  title="Edit comment"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors duration-300"
                  title="Delete comment"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Comment Content */}
          {editingComment === comment.id ? (
            <div className="mb-4">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full border border-gray-300 rounded-2xl px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all duration-300 bg-white/50"
                rows="3"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditComment(comment.id)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] text-white font-bold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingComment(null);
                    setEditContent("");
                  }}
                  className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transform hover:scale-105 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 leading-relaxed text-lg mb-4">{comment.content}</p>
          )}

          {/* Reply Button */}
          {depth < maxDepth && token && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-[#FF6B35] transition-colors duration-300 rounded-xl hover:bg-gray-100"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                </svg>
                Reply
              </button>
              
              {comment.has_replies || comment.replies?.length > 0 ? (
                <span className="text-sm text-gray-500">
                  {comment.replies?.length || 0} {comment.replies?.length === 1 ? 'reply' : 'replies'}
                </span>
              ) : null}
            </div>
          )}

          {/* Reply Input */}
          {replyingTo === comment.id && (
            <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#E55A2B] rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`Replying to ${comment.user}...`}
                    className="w-full border border-gray-300 rounded-2xl px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all duration-300 bg-white"
                    rows="3"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReply(comment.id)}
                      disabled={!replyContent.trim()}
                      className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] text-white font-bold hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-none transition-all duration-300"
                    >
                      Post Reply
                    </button>
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent("");
                      }}
                      className="px-6 py-2 rounded-xl bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transform hover:scale-105 transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Render Replies */}
        {comment.replies && comment.replies.map((reply) => (
          <CommentItem 
            key={reply.id} 
            comment={reply} 
            depth={depth + 1}
          />
        ))}
      </div>
    );
  };

  // Handle comment edit
  const handleEditComment = async (commentId) => {
    if (!editContent.trim()) return;
    
    try {
      // Note: You'll need to add an edit comment endpoint in your backend
      // For now, we'll simulate the update locally
      const updatedComments = recipe.comments.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, content: editContent, updated_at: new Date().toISOString() };
        }
        
        // Also check replies
        if (comment.replies) {
          const updatedReplies = comment.replies.map(reply => 
            reply.id === commentId 
              ? { ...reply, content: editContent, updated_at: new Date().toISOString() }
              : reply
          );
          return { ...comment, replies: updatedReplies };
        }
        
        return comment;
      });
      
      setRecipe({ ...recipe, comments: updatedComments });
      setEditContent("");
      setEditingComment(null);
      alert("Comment updated successfully!");
    } catch (err) {
      console.error("Failed to edit comment:", err);
      alert("Failed to edit comment. Please try again.");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-[#FF6B35] mb-4"></div>
        <p className="text-gray-600 font-medium">Loading delicious recipe...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-500 text-xl font-semibold mb-2">{error}</p>
        <p className="text-gray-600">Please try refreshing the page</p>
      </div>
    </div>
  );

  const ratingDistribution = calculateRatingDistribution(recipe.ratings);
  const { averageRating, totalRatings } = calculateRatingStats(recipe.ratings);
  const relatedRecipes = recipe.related_recipes || [];
  const nutrientData = recipe.nutrient || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-r from-[#FF6B35]/10 to-[#E55A2B]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-r from-[#FF6B35]/5 to-[#E55A2B]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className={`text-center mb-16 transition-all duration-1000 ${animateElements ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/20 mb-6">
            <div className="w-2 h-2 bg-[#FF6B35] rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-600">Recipe Details</span>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-black mb-6 bg-gradient-to-r from-gray-900 via-[#FF6B35] to-[#E55A2B] bg-clip-text text-transparent leading-tight">
            {recipe.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-center gap-4 text-gray-600 mb-8">
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-white/20">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(averageRating) ? 'text-[#FF6B35] fill-current' : 'text-gray-300'}`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <span className="font-semibold text-gray-800">{averageRating.toFixed(1)}</span>
              <span className="text-sm">({totalRatings} reviews)</span>
            </div>
            
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-white/20">
              <svg className="w-5 h-5 text-[#FF6B35]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
              </svg>
              <span className="font-medium">By {recipe.author}</span>
              {/* Follow Button for Recipe Author - Only show if user is logged in and not viewing their own recipe */}
              {token && recipe.author_id && recipe.author_id.toString() !== localStorage.getItem("user_id") && (
                <FollowButton 
                  targetUserId={recipe.author_id} 
                  targetUsername={recipe.author}
                  initialIsFollowing={isFollowingAuthor}
                />
              )}
            </div>
            
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-white/20">
              <svg className="w-5 h-5 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span className="font-medium">{new Date(recipe.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Hero Image Section */}
        <div className={`relative mb-16 transition-all duration-1000 delay-300 ${animateElements ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="relative h-80 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl group">
            <img
              src={recipe.image.startsWith("http") ? recipe.image : `${API_BASE}${recipe.image}`}
              alt={recipe.title}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
          
          {/* Floating Stats Overlay */}
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4">
            <div className="bg-white/95 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-semibold text-gray-800">{recipe.prep_time + recipe.cook_time} mins</span>
            </div>
            <div className="bg-white/95 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="font-semibold text-gray-800">{recipe.servings} servings</span>
            </div>
            <div className="bg-white/95 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="font-semibold text-gray-800 capitalize">{recipe.difficulty}</span>
            </div>
          </div>
        </div>

        {/* Video Section */}
        {recipe.video && (
          <div className={`mb-16 transition-all duration-1000 delay-500 ${animateElements ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] p-1 rounded-3xl shadow-2xl">
              <video  key={recipe.video}  controls className="w-full rounded-2xl shadow-lg">
                <source src={recipe.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Ingredients & Nutrition */}
          <div className="lg:col-span-1 space-y-8">
            {/* Ingredients Card */}
            <div className={`transition-all duration-700 delay-700 ${animateElements ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
              <section className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-[#FF6B35] bg-clip-text text-transparent">
                    Ingredients
                  </h2>
                </div>
                <ul className="space-y-4">
                  {recipe.ingredients.split("\n").map((ing, idx) => (
                    <li 
                      key={idx} 
                      className={`flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 cursor-pointer group ${
                        checkedIngredients[idx] 
                          ? 'bg-green-50 border border-green-200 scale-95' 
                          : 'bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-200'
                      }`}
                      onClick={() => toggleIngredient(idx)}
                    >
                      <div className={`relative flex-shrink-0 w-6 h-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-center ${
                        checkedIngredients[idx] 
                          ? 'bg-[#FF6B35] border-[#FF6B35] scale-110' 
                          : 'bg-white border-gray-300 group-hover:border-[#FF6B35]'
                      }`}>
                        {checkedIngredients[idx] && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`leading-relaxed transition-all duration-300 ${
                        checkedIngredients[idx] 
                          ? 'text-gray-500 line-through' 
                          : 'text-gray-700 group-hover:text-gray-900'
                      }`}>
                        {ing}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* Nutrition Facts Card */}
            {nutrientData && Object.keys(nutrientData).length > 0 && (
              <div className={`transition-all duration-700 delay-800 ${animateElements ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                <section className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-[#FF6B35] bg-clip-text text-transparent">
                      Nutrition
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {Object.entries(nutrientData).map(([key, value], idx) => (
                      <div 
                        key={key} 
                        className="flex justify-between items-center p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-white hover:from-[#FF6B35]/5 hover:to-[#FF6B35]/10 border border-transparent hover:border-[#FF6B35]/20 transition-all duration-300 transform hover:scale-105"
                      >
                        <span className="font-semibold capitalize text-gray-700">{key}</span>
                        <span className="font-bold text-[#FF6B35] bg-white px-3 py-1 rounded-full shadow-sm">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* Rating Distribution */}
            <div className={`transition-all duration-700 delay-900 ${animateElements ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
              <section className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-[#FF6B35] bg-clip-text text-transparent">
                    Ratings
                  </h2>
                </div>
                <div className="space-y-4">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const percentage = totalRatings > 0 ? (ratingDistribution[stars] / totalRatings) * 100 : 0;
                    return (
                      <div key={stars} className="flex items-center gap-4 group">
                        <span className="text-lg font-bold text-gray-600 w-12">{stars}★</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                          <div 
                            className="bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] h-full rounded-full transition-all duration-1000 ease-out group-hover:from-[#E55A2B] group-hover:to-[#FF6B35]"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-500 w-16">{percentage.toFixed(0)}%</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>

          {/* Right Column - Instructions, Actions & Comments */}
          <div className="lg:col-span-2 space-y-8">
            {/* Instructions Card */}
            <div className={`transition-all duration-700 delay-600 ${animateElements ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
              <section className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-[#FF6B35] bg-clip-text text-transparent">
                    Instructions
                  </h2>
                </div>
                <ol className="space-y-8">
                  {recipe.instruction.split("\n").map((step, idx) => (
                    <li key={idx} className="group">
                      <div className="flex gap-6 items-start transform transition-all duration-500 group-hover:scale-105">
                        <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-[#FF6B35] to-[#E55A2B] text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                          {idx + 1}
                        </div>
                        <div className="flex-1 pt-3">
                          <p className="text-gray-700 leading-relaxed text-lg group-hover:text-gray-900 transition-colors duration-300">
                            {step}
                          </p>
                        </div>
                      </div>
                      {idx < recipe.instruction.split("\n").length - 1 && (
                        <div className="ml-14 mt-8 border-l-2 border-dashed border-gray-300 h-8 transform group-hover:border-[#FF6B35] transition-all duration-500"></div>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            </div>

            {/* Interactive Actions Card */}
            <div className={`transition-all duration-700 delay-800 ${animateElements ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
              <section className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-[#FF6B35] bg-clip-text text-transparent">
                    Your Feedback
                  </h2>
                 
                </div>
                 
                
                <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                  {/* Favorite Button */}
                  <button
                    onClick={handleFavorite}
                    className={`flex-1 px-8 py-6 rounded-2xl font-bold text-lg transition-all duration-500 transform hover:scale-105 shadow-lg border-2 ${
                      recipe.is_favorite 
                        ? "bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] text-white border-transparent hover:shadow-2xl" 
                        : "bg-white text-gray-700 border-gray-200 hover:border-[#FF6B35] hover:shadow-2xl"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3">
                      {recipe.is_favorite ? (
                        <>
                          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                          </div>
                          <span>Saved to Favorites</span>
                        </>
                      ) : (
                        <>
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center group-hover:bg-[#FF6B35] transition-colors duration-300">
                            <svg className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                            </svg>
                          </div>
                          <span>Add to Favorites</span>
                        </>
                      )}
                    </div>
                  </button>
                  
                  {/* Rating Section */}
                  <div className="flex-1 bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-lg border border-gray-200">
                    <div className="flex flex-col items-center gap-4">
                      <label className="text-gray-700 font-bold text-lg">
                        {userRating > 0 ? `Your Rating: ${userRating}★` : "Rate this Recipe"}
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className={`text-3xl transition-all duration-300 transform hover:scale-125 hover:rotate-12 ${
                              star <= rating ? "text-[#FF6B35] animate-bounce" : "text-gray-300 hover:text-[#FF6B35]/50"
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      <button 
                        onClick={handleRating}
                        className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] text-white font-bold hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-none"
                      >
                        {userRating > 0 ? "Update Your Rating" : "Submit Rating"}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Modern Comments Section */}
            <div className={`transition-all duration-700 delay-1000 ${animateElements ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
              <section className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-[#FF6B35] bg-clip-text text-transparent">
                    Community ({recipe.comments.length})

                  </h2>
                    <div className="mb-6">
      <ShareRecipe 
        recipeId={recipe.id}
        recipeTitle={recipe.title}
        recipeImage={recipe.image.startsWith("http") ? recipe.image : `${API_BASE}${recipe.image}`}
        authorId={recipe.author_id}
      />
    </div>
                </div>
                
                {/* Add Comment */}
                <div className="mb-8 p-6 bg-gradient-to-r from-gray-50/80 to-white/80 rounded-2xl shadow-inner border border-gray-200/50">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#E55A2B] rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg transform hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your thoughts about this recipe..."
                        className="w-full border border-gray-300 rounded-2xl px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all duration-300 bg-white/50"
                        rows="4"
                      />
                      <button 
                        onClick={handleComment}
                        disabled={!comment.trim()}
                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] text-white font-bold hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-none transition-all duration-300"
                      >
                        Post Comment
                      </button>
                    </div>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-6">
                  {recipe.comments
                    .filter(comment => !comment.parent) // Only show top-level comments
                    .map((comment, index) => (
                      <CommentItem 
                        key={comment.id} 
                        comment={comment}
                        style={{ animationDelay: `${index * 100}ms` }}
                      />
                    ))}
                  
                  {recipe.comments.filter(comment => !comment.parent).length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                        </svg>
                      </div>
                      <p className="text-gray-500 text-lg">No comments yet. Be the first to share your thoughts!</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Related Recipes Carousel */}
            {relatedRecipes.length > 0 && (
              <div className={`transition-all duration-700 delay-1200 ${animateElements ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                <section className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-[#FF6B35] bg-clip-text text-transparent">
                      You Might Also Like
                    </h2>
                    <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#E55A2B] rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                      🔄
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relatedRecipes.map((r, index) => (
                      <Link
                        key={r.id}
                        to={`/recipe/${r.id}`}
                        className="block group"
                      >
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={r.image.startsWith("http") ? r.image : `${API_BASE}${r.image}`}
                              alt={r.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                            <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                                <p className="font-bold text-gray-800 text-sm line-clamp-2">
                                  {r.title}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              </div>
              
            )}
          </div>
        
        </div>
      </div>
       <div className="mt-8 col-start-8 ms-8">
  <AICookingCoach recipe={recipe} />
</div>
    </div>
    
  );
};

export default RecipeDetail;