import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // ✅ Check auth status
  const checkAuth = () => {
    const token = localStorage.getItem("access");
    setIsAuthenticated(!!token);
    if (token) {
      fetchNotifications();
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("access");
      if (!token) return;
      
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/auth/notifications/`,
        config
      );
      setNotifications(response.data.filter(notif => !notif.is_read));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // On mount, check auth
  useEffect(() => {
    checkAuth();
  }, []);

  // Listen for login events from LoginForm
  useEffect(() => {
    const handleLoginEvent = () => {
      checkAuth();
    };
    window.addEventListener("login", handleLoginEvent);
    return () => window.removeEventListener("login", handleLoginEvent);
  }, []);

  // Listen for localStorage changes (logout from other tabs)
  useEffect(() => {
    const handleStorageChange = () => {
      checkAuth();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user_email");
    setIsAuthenticated(false);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    setNotifications([]);
    navigate("/login");
  };

  const unreadCount = notifications.filter(notif => !notif.is_read).length;

  // Notification Bell Component
  const NotificationBell = () => (
    <div className="relative">
      <Link 
        to="/notifications"
        className="relative p-2 text-gray-600 hover:text-green-600 transition-colors duration-300 group"
        onMouseEnter={() => setShowNotificationDropdown(true)}
        onMouseLeave={() => setShowNotificationDropdown(false)}
      >
        <div className="relative p-2 rounded-xl group-hover:bg-green-50/50 transition-all duration-300">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </div>
      </Link>

      {/* Notification Dropdown Preview */}
      {showNotificationDropdown && unreadCount > 0 && (
        <div 
          className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100/50 z-50 animate-fade-in"
          onMouseEnter={() => setShowNotificationDropdown(true)}
          onMouseLeave={() => setShowNotificationDropdown(false)}
        >
          <div className="absolute -top-2 right-4 w-4 h-4 bg-white transform rotate-45 border-t border-l border-gray-100/50"></div>
          
          {/* Header */}
          <div className="p-4 border-b border-gray-100/50">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <p className="text-sm text-gray-500">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
          </div>
          
          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.slice(0, 3).map(notification => (
              <div 
                key={notification.id} 
                className="p-4 border-b border-gray-100/50 hover:bg-green-50/30 transition-colors duration-200 cursor-pointer"
                onClick={() => {
                  setShowNotificationDropdown(false);
                  navigate(`/recipe/${notification.recipe}`);
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {notification.sender.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {notification.sender}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      shared "{notification.recipe_title}" with you
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.shared_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Footer */}
          <div className="p-3 bg-gray-50/50 rounded-b-2xl">
            <Link
              to="/notifications"
              className="block text-center text-sm text-green-600 hover:text-green-700 font-medium py-2 rounded-lg hover:bg-green-50/50 transition-colors duration-200"
              onClick={() => setShowNotificationDropdown(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-2xl border-b border-gray-100/50' 
          : 'bg-white/90 backdrop-blur-lg shadow-lg'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-3 group"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl blur-sm opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent group-hover:from-green-700 group-hover:to-emerald-800 transition-all duration-300">
                RecipeShare
              </span>
            </Link>

            {/* Desktop Menu Items */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className="relative text-gray-600 hover:text-green-600 font-medium transition-all duration-300 group py-2"
              >
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                to="/recipe" 
                className="relative text-gray-600 hover:text-green-600 font-medium transition-all duration-300 group py-2"
              >
                Recipes
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                to="/about" 
                className="relative text-gray-600 hover:text-green-600 font-medium transition-all duration-300 group py-2"
              >
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
             

              {isAuthenticated && (
                <>
                 <Link 
                to="/add-recipe" 
                className="relative text-gray-600 hover:text-green-600 font-medium transition-all duration-300 group py-2"
              >
                Add Recipe
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/reels" className="text-gray-700 hover:text-green-600 flex items-center">
                <span className="mr-1">🎥</span> Reels
              </Link>
              <Link to="/discover" className="flex items-center text-gray-700 hover:text-blue-600">
                🔥 Discover Trends
              </Link>
                <Link 
                  to="/dashboard" 
                  className="relative text-gray-600 hover:text-green-600 font-medium transition-all duration-300 group py-2"
                >
                  Dashboard
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
                </>
              )}
            </div>

            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center space-x-4 relative">
              {isAuthenticated ? (
                <>
                  {/* Notification Bell */}
                  <NotificationBell />
                  
                  {/* Dropdown Toggle */}
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <span className="font-medium">Account</span>
                      <svg 
                        className={`w-4 h-4 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                      <div className="absolute right-0 top-14 bg-white/95 backdrop-blur-xl shadow-2xl border border-gray-100/50 rounded-2xl w-48 py-2 animate-fade-in">
                        <div className="absolute -top-2 right-4 w-4 h-4 bg-white transform rotate-45 border-t border-l border-gray-100/50"></div>
                        
                        {/* Notifications link */}
                        <Link
                          to="/notifications"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center space-x-3 w-full text-left px-4 py-3 text-gray-700 hover:bg-green-50/50 hover:text-green-600 transition-all duration-200 group"
                        >
                          <div className="relative">
                            <svg className="w-4 h-4 text-gray-400 group-hover:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center"></span>
                            )}
                          </div>
                          <span>Notifications</span>
                          {unreadCount > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {unreadCount}
                            </span>
                          )}
                        </Link>
                        
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            navigate("/dashboard");
                          }}
                          className="flex items-center space-x-3 w-full text-left px-4 py-3 text-gray-700 hover:bg-green-50/50 hover:text-green-600 transition-all duration-200 group"
                        >
                          <svg className="w-4 h-4 text-gray-400 group-hover:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Profile</span>
                        </button>
                        <div className="h-px bg-gray-100/50 my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 w-full text-left px-4 py-3 text-red-600 hover:bg-red-50/50 transition-all duration-200 group"
                        >
                          <svg className="w-4 h-4 text-red-400 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link 
                    to="/login" 
                    className="px-6 py-2.5 border-2 border-green-500 text-green-600 rounded-2xl hover:bg-green-500 hover:text-white transition-all duration-300 font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown - MOVED OUTSIDE the main nav container */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-white/95 backdrop-blur-xl shadow-2xl border-b border-gray-100/50 z-50 animate-fade-in">
            <div className="px-4 py-2 space-y-1">
              <Link 
                to="/" 
                className="block py-3 px-4 text-gray-600 hover:text-green-600 hover:bg-green-50/50 rounded-xl transition-all duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/recipe" 
                className="block py-3 px-4 text-gray-600 hover:text-green-600 hover:bg-green-50/50 rounded-xl transition-all duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Recipes
              </Link>
              <Link 
                to="/about" 
                className="block py-3 px-4 text-gray-600 hover:text-green-600 hover:bg-green-50/50 rounded-xl transition-all duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
             
             
            
              
              {isAuthenticated && (
                <>
               
                 <Link 
                to="/add-recipe" 
                className="block py-3 px-4 text-gray-600 hover:text-green-600 hover:bg-green-50/50 rounded-xl transition-all duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Add Recipe
              </Link>
                 <Link 
                to="/reels" 
                className="block py-3 px-4 text-gray-600 hover:text-green-600 hover:bg-green-50/50 rounded-xl transition-all duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                🎥 Reels
              </Link>
                 <Link 
                to="/discover" 
                className="block py-3 px-4 text-gray-600 hover:text-green-600 hover:bg-green-50/50 rounded-xl transition-all duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                🔥 Discover Trends
              </Link>
                  <Link 
                    to="/dashboard" 
                    className="block py-3 px-4 text-gray-600 hover:text-green-600 hover:bg-green-50/50 rounded-xl transition-all duration-200 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/notifications" 
                    className="block py-3 px-4 text-gray-600 hover:text-green-600 hover:bg-green-50/50 rounded-xl transition-all duration-200 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Notifications {unreadCount > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 inline-flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                  <div className="h-px bg-gray-100/50 my-2"></div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left py-3 px-4 text-red-600 hover:bg-red-50/50 rounded-xl transition-all duration-200 font-medium"
                  >
                    Logout
                  </button>
                </>
              )}
              
              {!isAuthenticated && (
                <div className="pt-2 pb-4 border-t border-gray-100/50 mt-2">
                  <div className="space-y-2">
                    <Link 
                      to="/login" 
                      className="block w-full text-center py-3 border-2 border-green-500 text-green-600 rounded-2xl hover:bg-green-500 hover:text-white transition-all duration-300 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link 
                      to="/signup" 
                      className="block w-full text-center py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Backdrop for dropdowns */}
        {(dropdownOpen || showNotificationDropdown || mobileMenuOpen) && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => {
              setDropdownOpen(false);
              setShowNotificationDropdown(false);
              setMobileMenuOpen(false);
            }}
          ></div>
        )}
      </nav>

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-20"></div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Navbar;