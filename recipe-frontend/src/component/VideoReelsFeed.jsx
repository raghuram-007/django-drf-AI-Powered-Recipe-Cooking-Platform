// src/components/VideoReelsFeed.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axiosInstance from '../api/axios'; // ✅ use centralized axios
import VideoReel from './VideoReel';
import LoadingSpinner from './LoadingSpinner';

const VideoReelsFeed = () => {
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const containerRef = useRef(null);

  const fetchVideos = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/recipes/?ordering=-created_at&page=${pageNum}`);
      const data = response.data;

      let videoRecipes = [];
      if (data.results) {
        videoRecipes = data.results.filter(r => r.video);
        setHasMore(!!data.next);
      } else if (Array.isArray(data)) {
        videoRecipes = data.filter(r => r.video);
        setHasMore(false);
      }

      setVideos(prev => (pageNum === 1 ? videoRecipes : [...prev, ...videoRecipes]));
      setPage(pageNum);
    } catch (err) {
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    fetchVideos(1);
  }, []);

  // Wheel scroll navigation with passive: false
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault(); // safe now
      if (e.deltaY > 5 && currentIndex < videos.length - 1) setCurrentIndex(prev => prev + 1);
      else if (e.deltaY < -5 && currentIndex > 0) setCurrentIndex(prev => prev - 1);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => container.removeEventListener('wheel', handleWheel);
  }, [currentIndex, videos.length]);

  // Load more videos if near the end
  useEffect(() => {
    if (currentIndex >= videos.length - 2 && hasMore && !loading) {
      fetchVideos(page + 1);
    }
  }, [currentIndex, videos.length, hasMore, loading, page]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowDown' && currentIndex < videos.length - 1) setCurrentIndex(prev => prev + 1);
      else if (e.key === 'ArrowUp' && currentIndex > 0) setCurrentIndex(prev => prev - 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex, videos.length]);

  // Placeholder actions
  const handleLike = (recipeId) => console.log('Like', recipeId);
  const handleComment = (recipeId, comment) => console.log('Comment', recipeId, comment);
  const handleShare = (recipeId) => console.log('Share', recipeId);

  if (loading && videos.length === 0) return <LoadingSpinner />;

  if (!loading && videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No recipe videos yet</h2>
          <p className="text-gray-400">Be the first to upload a cooking video!</p>
          <button
            onClick={() => fetchVideos(1)}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full bg-black overflow-hidden"
    >
      {videos.map((video, index) => (
        <VideoReel
          key={video.id}
          recipe={video}
          isActive={index === currentIndex}
          onLike={() => handleLike(video.id)}
          onComment={(comment) => handleComment(video.id, comment)}
          onShare={() => handleShare(video.id)}
        />
      ))}

      {/* Navigation dots */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-10">
        {videos.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full my-2 transition-all ${
              index === currentIndex ? 'bg-white scale-125' : 'bg-gray-500'
            }`}
          />
        ))}
      </div>

      {loading && videos.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
};

export default VideoReelsFeed;
