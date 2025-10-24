// src/components/ShareRecipe.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const ShareRecipe = ({ recipeId, recipeTitle, recipeImage, authorId }) => {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showFollowersList, setShowFollowersList] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [selectedFollowers, setSelectedFollowers] = useState([]);
  const [shareMessage, setShareMessage] = useState("");
  const [sharing, setSharing] = useState(false);
  const [loadingFollowers, setLoadingFollowers] = useState(false);

  const token = localStorage.getItem("access");
  const config = {
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  };

  // Fetch followers list
  const fetchFollowers = async () => {
    if (!token) return;
    
    setLoadingFollowers(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/auth/followers/`,
        config
      );
      setFollowers(response.data);
    } catch (error) {
      console.error("Error fetching followers:", error);
      alert("Failed to load followers list");
    } finally {
      setLoadingFollowers(false);
    }
  };

  // Open followers selection
  const openFollowersSelection = () => {
    if (!token) {
      alert("Please login to share recipes with followers");
      return;
    }
    fetchFollowers();
    setShowFollowersList(true);
    setShowShareOptions(false);
  };

  // Direct share to specific followers
  const shareToSelectedFollowers = async () => {
    if (selectedFollowers.length === 0) {
      alert("Please select at least one follower to share with");
      return;
    }

    setSharing(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/recipes/${recipeId}/direct_share/`,
        {
          receiver_ids: selectedFollowers,
          message: shareMessage
        },
        config
      );
      
      alert(response.data.detail || "Recipe shared successfully!");
      setShowFollowersList(false);
      setSelectedFollowers([]);
      setShareMessage("");
    } catch (error) {
      console.error("Error sharing to followers:", error);
      if (error.response?.status === 401) {
        alert("Please login to share recipes");
      } else if (error.response?.status === 400) {
        alert(error.response.data.detail || "Failed to share recipe");
      } else {
        alert("Failed to share recipe. Please try again.");
      }
    } finally {
      setSharing(false);
    }
  };

  // Toggle follower selection
  const toggleFollowerSelection = (followerId) => {
    setSelectedFollowers(prev => 
      prev.includes(followerId)
        ? prev.filter(id => id !== followerId)
        : [...prev, followerId]
    );
  };

  // Select all followers
  const selectAllFollowers = () => {
    if (selectedFollowers.length === followers.length) {
      setSelectedFollowers([]);
    } else {
      setSelectedFollowers(followers.map(f => f.id));
    }
  };

  // External social media sharing
  const shareToSocialMedia = (platform) => {
    const currentUrl = window.location.href;
    const text = `Check out this amazing recipe: ${recipeTitle}`;
    
    let shareUrl = "";
    
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(currentUrl)}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${currentUrl}`)}`;
        break;
      case "pinterest":
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(currentUrl)}&description=${encodeURIComponent(text)}${recipeImage ? `&media=${encodeURIComponent(recipeImage)}` : ''}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
        break;
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(text)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, "_blank", "width=600,height=400");
    setShowShareOptions(false);
  };

  // Copy link to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Recipe link copied to clipboard!");
      setShowShareOptions(false);
    } catch (err) {
      console.error("Failed to copy: ", err);
      alert("Failed to copy link. Please try again.");
    }
  };

  return (
    <div className="relative z-[100]">
      {/* Share Button */}
      <button
        onClick={() => setShowShareOptions(!showShareOptions)}
        className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 shadow-lg z-[101] relative"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share Recipe
      </button>

      {/* Overlay to close when clicking outside */}
      {(showShareOptions || showFollowersList) && (
        <div 
          className="fixed inset-0 z-[99] bg-black/30 backdrop-blur-sm" 
          onClick={() => {
            setShowShareOptions(false);
            setShowFollowersList(false);
          }}
        />
      )}

      {/* Share Options Dropdown */}
      {showShareOptions && (
        <div className="absolute top-full left-0 mt-3 w-80 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 z-[102] overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
            <h3 className="font-bold text-lg">Share this Recipe</h3>
            <p className="text-sm opacity-90">Spread the culinary love!</p>
          </div>

          {/* Share Options */}
          <div className="p-4 space-y-3">
            {/* Internal Sharing */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Share with Followers</h4>
              <button
                onClick={openFollowersSelection}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>Share with Specific Followers</span>
              </button>
            </div>

            {/* External Sharing */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Share on Social Media</h4>
              <div className="grid grid-cols-2 gap-2">
                {/* WhatsApp */}
                <button
                  onClick={() => shareToSocialMedia("whatsapp")}
                  className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transform hover:scale-105 transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893-.001-3.189-1.262-6.209-3.553-8.485"/>
                  </svg>
                  <span className="text-sm">WhatsApp</span>
                </button>

                {/* Twitter */}
                <button
                  onClick={() => shareToSocialMedia("twitter")}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-400 text-white rounded-xl hover:bg-blue-500 transform hover:scale-105 transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.213c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  <span className="text-sm">Twitter</span>
                </button>

                {/* Pinterest */}
                <button
                  onClick={() => shareToSocialMedia("pinterest")}
                  className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transform hover:scale-105 transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.017 12.014 0 12.017 0 12.017 0z"/>
                  </svg>
                  <span className="text-sm">Pinterest</span>
                </button>

                {/* Facebook */}
                <button
                  onClick={() => shareToSocialMedia("facebook")}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="text-sm">Facebook</span>
                </button>
              </div>
            </div>

            {/* Copy Link */}
            <div className="pt-2 border-t border-gray-200">
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transform hover:scale-105 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy Recipe Link</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Followers Selection Modal - FIXED VERSION */}
      {showFollowersList && (
        <div className="fixed inset-4 sm:inset-10 md:inset-20 lg:inset-40 xl:inset-60 z-[102] flex items-center justify-center">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 w-full max-w-md max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-2xl">
              <h3 className="font-bold text-lg">Share with Followers</h3>
              <p className="text-sm opacity-90">Select followers to share with</p>
            </div>

            {/* Followers List - Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-4">
              {loadingFollowers ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : followers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <p>You're not following anyone yet.</p>
                </div>
              ) : (
                <>
                  {/* Select All */}
                  <div className="flex items-center gap-3 p-3 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <input
                      type="checkbox"
                      checked={selectedFollowers.length === followers.length && followers.length > 0}
                      onChange={selectAllFollowers}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="font-medium text-gray-700">Select All</span>
                    <span className="text-sm text-gray-500 ml-auto">
                      {selectedFollowers.length} selected
                    </span>
                  </div>

                  {/* Followers List */}
                  <div className="space-y-2 mt-3">
                    {followers.map((follower) => (
                      <div
                        key={follower.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 border border-gray-100"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFollowers.includes(follower.id)}
                          onChange={() => toggleFollowerSelection(follower.id)}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 flex-shrink-0"
                        />
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {follower.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{follower.username}</p>
                          <p className="text-sm text-gray-500 truncate">{follower.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Message Input and Actions */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <textarea
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                placeholder="Add a personal message (optional)"
                className="w-full border border-gray-300 rounded-xl px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
                rows="2"
              />
              <div className="flex gap-2">
                <button
                  onClick={shareToSelectedFollowers}
                  disabled={sharing || selectedFollowers.length === 0}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none font-medium"
                >
                  {sharing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sharing...
                    </div>
                  ) : (
                    `Share with ${selectedFollowers.length} follower${selectedFollowers.length !== 1 ? 's' : ''}`
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowFollowersList(false);
                    setSelectedFollowers([]);
                    setShareMessage("");
                  }}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transform hover:scale-105 transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareRecipe;