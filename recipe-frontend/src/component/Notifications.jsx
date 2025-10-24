// src/components/Notifications.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access");
  const config = {
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/auth/notifications/`,
        config
      );
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (shareId) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/auth/notifications/${shareId}/read/`,
        {},
        config
      );
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === shareId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            <p className="text-purple-200">Recipes shared with you</p>
          </div>

          {/* Notifications List */}
          <div className="p-6">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
                <p className="text-gray-500">When someone shares a recipe with you, it will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      notification.is_read 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-purple-50 border-purple-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {notification.sender.charAt(0).toUpperCase()}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">
                              <span className="text-purple-600">{notification.sender}</span> shared a recipe with you
                            </p>
                            <p className="text-gray-600 mt-1">{notification.recipe_title}</p>
                            {notification.message && (
                              <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-700">{notification.message}</p>
                              </div>
                            )}
                            <p className="text-sm text-gray-500 mt-2">
                              {new Date(notification.shared_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          
                          {!notification.is_read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="ml-4 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex gap-3 mt-4">
                          <Link
                            to={`/recipe/${notification.recipe}`}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium"
                          >
                            View Recipe
                          </Link>
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                          >
                            {notification.is_read ? 'Read' : 'Mark as Read'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;