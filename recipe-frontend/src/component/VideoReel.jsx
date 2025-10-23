// src/components/VideoReel.jsx
import React, { useRef, useEffect, useState } from 'react';
import { Heart, MessageCircle, Share, Bookmark, Play, Pause, Volume2, VolumeX, X } from 'lucide-react';
import axiosInstance from '../api/axios';

const VideoReel = ({ recipe, isActive, onLike, onComment, onShare }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(recipe.is_favorite || false);
  const [likesCount, setLikesCount] = useState(recipe.favorites_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [commentText, setCommentText] = useState('');

  const videoUrl = recipe.video?.startsWith('http') 
      ? recipe.video 
      : `https://django-drf-ai-powered-recipe-cooking.onrender.com${recipe.video}`;

  useEffect(() => {
    if (videoRef.current) {
      if (isActive && isPlaying) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  }, [isActive, isPlaying]);

  const togglePlay = () => setIsPlaying(prev => !prev);
  
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(prev => !prev);
    }
  };

  const handleLike = async () => {
    try {
      if (isLiked) await axiosInstance.post(`/recipes/${recipe.id}/remove_favorite/`);
      else await axiosInstance.post(`/recipes/${recipe.id}/add_favorite/`);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
      setIsLiked(prev => !prev);
      onLike?.();
    } catch (err) { 
      console.error('Error liking recipe', err); 
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await axiosInstance.post(`/recipes/${recipe.id}/add_comment/`, { content: commentText });
      setCommentText('');
      onComment?.(commentText);
      setShowComments(false);
      setTimeout(() => setShowComments(true), 100);
    } catch (err) { 
      console.error('Error posting comment', err); 
    }
  };

  const handleShareClick = () => {
    setShowShareModal(true);
    onShare?.();
  };

  const closeShareModal = () => {
    setShowShareModal(false);
  };

  const shareToFollowers = async () => {
    setSharing(true);
    try {
      await axiosInstance.post(`/recipes/${recipe.id}/share_to_followers/`);
      // Smooth success notification
      const successEl = document.createElement('div');
      successEl.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl z-50 transform translate-x-full animate-slide-in';
      successEl.textContent = '✅ Recipe shared with followers!';
      document.body.appendChild(successEl);
      
      setTimeout(() => {
        successEl.classList.add('animate-slide-out');
        setTimeout(() => document.body.removeChild(successEl), 300);
      }, 3000);
      
      closeShareModal();
    } catch (error) {
      console.error("Error sharing to followers:", error);
      alert("Failed to share recipe");
    } finally {
      setSharing(false);
    }
  };

  const shareToSocialMedia = (platform) => {
    const currentUrl = window.location.href;
    const text = `Check out this amazing recipe: ${recipe.title}`;
    
    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${currentUrl}`)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(currentUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    };
    
    window.open(shareUrls[platform], "_blank", "width=600,height=400");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      // Smooth copy notification
      const copyEl = document.createElement('div');
      copyEl.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-xl shadow-2xl z-50 transform translate-x-full animate-slide-in';
      copyEl.textContent = '📋 Link copied to clipboard!';
      document.body.appendChild(copyEl);
      
      setTimeout(() => {
        copyEl.classList.add('animate-slide-out');
        setTimeout(() => document.body.removeChild(copyEl), 300);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      alert("Failed to copy link");
    }
  };

  return (
    <div className={`absolute top-0 left-0 w-full h-full transition-all duration-700 ease-in-out ${
      isActive 
        ? 'opacity-100 scale-100 translate-y-0' 
        : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
    }`}>
      {/* Video Container */}
      <div className="relative w-full h-full bg-black rounded-3xl overflow-hidden shadow-2xl">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            loop
            muted={isMuted}
            className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-105"
            onClick={togglePlay}
            playsInline
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
                <span className="text-2xl">🎥</span>
              </div>
              <p className="text-gray-400 font-medium">No video available</p>
            </div>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Top Controls */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
          <button 
            onClick={() => window.history.back()}
            className="group bg-black/40 backdrop-blur-md text-white p-3 rounded-2xl hover:bg-black/60 transition-all duration-300 hover:scale-110 shadow-2xl border border-white/10 hover:border-white/20"
          >
            <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          
          <div className="flex gap-3">
            <button 
              onClick={togglePlay}
              className="group bg-black/40 backdrop-blur-md text-white p-3 rounded-2xl hover:bg-black/60 transition-all duration-300 hover:scale-110 shadow-2xl border border-white/10 hover:border-white/20"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 transform group-hover:scale-110 transition-transform duration-300" />
              ) : (
                <Play className="w-6 h-6 transform group-hover:scale-110 transition-transform duration-300" />
              )}
            </button>
            <button 
              onClick={toggleMute}
              className="group bg-black/40 backdrop-blur-md text-white p-3 rounded-2xl hover:bg-black/60 transition-all duration-300 hover:scale-110 shadow-2xl border border-white/10 hover:border-white/20"
            >
              {isMuted ? (
                <VolumeX className="w-6 h-6 transform group-hover:scale-110 transition-transform duration-300" />
              ) : (
                <Volume2 className="w-6 h-6 transform group-hover:scale-110 transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>

        {/* Recipe Info Bottom */}
        <div className="absolute bottom-6 left-6 right-6 text-white transform transition-all duration-500 hover:translate-y-[-5px]">
          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
            <h2 className="text-2xl font-bold mb-3 text-white drop-shadow-lg">{recipe.title}</h2>
            <p className="text-gray-200 text-sm mb-4 leading-relaxed opacity-90">{recipe.description}</p>
            <div className="flex items-center gap-6 text-sm text-gray-300">
              <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                👤 {recipe.author}
              </span>
              <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                ⏱️ {recipe.prep_time + recipe.cook_time}min
              </span>
              <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                🍽️ {recipe.servings} servings
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="absolute right-6 bottom-32 flex flex-col items-center gap-5">
          {/* Like Button */}
          <div className="group relative">
            <button 
              onClick={handleLike}
              className="flex flex-col items-center p-4 bg-black/40 backdrop-blur-md rounded-2xl hover:bg-black/60 transition-all duration-300 hover:scale-110 shadow-2xl border border-white/10 hover:border-white/20"
            >
              <Heart 
                size={28} 
                className={`transition-all duration-300 ${
                  isLiked 
                    ? "fill-red-500 text-red-500 transform scale-110 drop-shadow-lg" 
                    : "text-white group-hover:text-red-400"
                }`} 
              />
              <span className="text-white text-xs mt-2 font-medium drop-shadow-lg">{likesCount}</span>
            </button>
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {isLiked ? 'Liked' : 'Like'}
            </div>
          </div>

          {/* Comment Button */}
          <div className="group relative">
            <button 
              onClick={() => setShowComments(!showComments)}
              className="flex flex-col items-center p-4 bg-black/40 backdrop-blur-md rounded-2xl hover:bg-black/60 transition-all duration-300 hover:scale-110 shadow-2xl border border-white/10 hover:border-white/20"
            >
              <MessageCircle size={28} className="text-white group-hover:text-blue-400 transition-colors duration-300" />
              <span className="text-white text-xs mt-2 font-medium drop-shadow-lg">{recipe.comments?.length || 0}</span>
            </button>
            <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Comment
            </div>
          </div>

          {/* Share Button */}
          <div className="group relative">
            <button 
              onClick={handleShareClick}
              className="flex flex-col items-center p-4 bg-black/40 backdrop-blur-md rounded-2xl hover:bg-black/60 transition-all duration-300 hover:scale-110 shadow-2xl border border-white/10 hover:border-white/20"
            >
              <Share size={28} className="text-white group-hover:text-green-400 transition-colors duration-300" />
              <span className="text-white text-xs mt-2 font-medium drop-shadow-lg">Share</span>
            </button>
            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Share
            </div>
          </div>

          {/* Bookmark Button */}
          <div className="group relative">
            <button className="flex flex-col items-center p-4 bg-black/40 backdrop-blur-md rounded-2xl hover:bg-black/60 transition-all duration-300 hover:scale-110 shadow-2xl border border-white/10 hover:border-white/20">
              <Bookmark size={28} className="text-white group-hover:text-purple-400 transition-colors duration-300" />
              <span className="text-white text-xs mt-2 font-medium drop-shadow-lg">Save</span>
            </button>
            <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Save
            </div>
          </div>
        </div>
      </div>

      {/* Comments Panel */}
      {showComments && (
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-black/95 backdrop-blur-xl text-white p-6 rounded-t-3xl shadow-2xl border-t border-white/10 animate-slide-up">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Comments 💬</h3>
            <button 
              onClick={() => setShowComments(false)}
              className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-110"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="h-3/4 overflow-y-auto mb-6 space-y-4 pr-2 custom-scrollbar">
            {recipe.comments?.map(c => (
              <div key={c.id} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-white/10">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-white">{c.user}</span>
                  <span className="text-gray-400 text-sm">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-200 leading-relaxed">{c.content}</p>
              </div>
            ))}
            {!recipe.comments?.length && (
              <div className="text-center py-8 text-gray-400">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageCircle size={24} className="text-gray-400" />
                </div>
                <p>No comments yet</p>
                <p className="text-sm">Be the first to comment!</p>
              </div>
            )}
          </div>

          <form onSubmit={handleCommentSubmit} className="flex gap-3">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
            <button 
              type="submit"
              disabled={!commentText.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed font-medium"
            >
              Post
            </button>
          </form>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl shadow-2xl border border-white/10 w-full max-w-md overflow-hidden transform animate-scale-in">
            {/* Modal Header */}
            <div className="p-8 bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Share Recipe</h3>
                  <p className="text-purple-100 opacity-90">Spread the culinary love! 🍳</p>
                </div>
                <button 
                  onClick={closeShareModal}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-110"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Share Options */}
            <div className="p-8 space-y-6">
              {/* Share with Followers */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-300 text-sm uppercase tracking-wider">Share with Followers</h4>
                <button
                  onClick={shareToFollowers}
                  disabled={sharing}
                  className="w-full flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none group"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <span className="font-medium">{sharing ? "Sharing..." : "Share with All Followers"}</span>
                </button>
              </div>

              {/* Social Media Sharing */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-300 text-sm uppercase tracking-wider">Share on Social Media</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { platform: "whatsapp", color: "bg-green-500 hover:bg-green-600", label: "WhatsApp" },
                    { platform: "twitter", color: "bg-blue-400 hover:bg-blue-500", label: "Twitter" },
                    { platform: "facebook", color: "bg-blue-600 hover:bg-blue-700", label: "Facebook" },
                    { platform: "copy", color: "bg-gray-600 hover:bg-gray-700", label: "Copy Link", action: copyToClipboard }
                  ].map((item) => (
                    <button
                      key={item.platform}
                      onClick={item.action || (() => shareToSocialMedia(item.platform))}
                      className={`flex items-center justify-center gap-2 px-4 py-3 ${item.color} text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoReel;