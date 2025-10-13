// src/components/FollowButton.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';

const FollowButton = ({ targetUserId, targetUsername, initialIsFollowing = false }) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  const handleFollowToggle = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        await axiosInstance.post(`/follows/unfollow/`, { user_id: targetUserId });
        setIsFollowing(false);
      } else {
        // Follow
        await axiosInstance.post(`/follows/follow/`, { user_id: targetUserId });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert('Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

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

export default FollowButton;