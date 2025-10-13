import React, { useState } from "react";
import { Facebook, Instagram, Twitter, Youtube, ChefHat, Heart, Mail } from "lucide-react";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const quickLinks = [
    { name: 'Explore Recipes' },
    { name: 'Popular Categories' },
    { name: "Chef's Special" },
    { name: 'Seasonal Picks' },
    { name: 'Cooking Tips' }
  ];

  const resources = [
    { name: 'Cooking Guides' },
    { name: 'Recipe Videos' },
    { name: 'Blog & Articles'},
    { name: 'Community Forum' },
    { name: 'Cooking Classes' }
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com", label: "Facebook", color: "hover:text-blue-600" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram", color: "hover:text-pink-600" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter", color: "hover:text-blue-400" },
    { icon: Youtube, href: "https://youtube.com", label: "YouTube", color: "hover:text-red-600" }
  ];

  return (
    <footer className="bg-gradient-to-b from-white to-gray-50/80 border-t border-gray-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-orange-500 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-green-500 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/3 w-12 h-12 bg-purple-500 rounded-full blur-lg"></div>
      </div>

      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

          {/* Brand Section - Enhanced */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6 transform hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-orange-600 bg-clip-text text-transparent">
                  FlavorShare
                </span>
                <p className="text-xs text-gray-500 font-medium">Culinary Community</p>
              </div>
            </div>
            <p className="text-gray-600 mb-8 leading-relaxed text-sm font-light">
              Sharing flavors, one recipe at a time. Join our community of passionate food lovers and culinary creators worldwide.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative"
                  aria-label={social.label}
                >
                  <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-gray-200 border border-gray-100 group-hover:shadow-xl group-hover:scale-110 group-hover:border-orange-200 transition-all duration-300">
                    <social.icon className={`w-5 h-5 text-gray-500 ${social.color} transition-colors duration-300`} />
                  </div>
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                      {social.label}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links - Enhanced */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <a
                    href="#"
                    className="group flex items-center gap-3 text-gray-600 hover:text-orange-500 transition-all duration-300 py-1.5"
                  >
                    <span className="text-lg transform group-hover:scale-110 transition-transform duration-300">
                      {link.icon}
                    </span>
                    <span className="font-medium group-hover:translate-x-1 transition-transform duration-300">
                      {link.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources - Enhanced */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Resources
            </h3>
            <ul className="space-y-3">
              {resources.map((resource, idx) => (
                <li key={idx}>
                  <a
                    href="#"
                    className="group flex items-center gap-3 text-gray-600 hover:text-green-500 transition-all duration-300 py-1.5"
                  >
                    <span className="text-lg transform group-hover:scale-110 transition-transform duration-300">
                      {resource.icon}
                    </span>
                    <span className="font-medium group-hover:translate-x-1 transition-transform duration-300">
                      {resource.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter - Enhanced */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Stay Updated
            </h3>
            <p className="text-gray-600 mb-6 text-sm font-light leading-relaxed">
              Subscribe to get the latest recipes, cooking tips, and exclusive content delivered to your inbox.
            </p>
            
            {isSubscribed ? (
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-2xl shadow-lg shadow-green-500/25 text-center animate-pulse">
                <div className="flex items-center justify-center gap-2">
                  <Heart className="w-5 h-5 fill-current" />
                  <span className="font-semibold">Thank you for subscribing!</span>
                </div>
                <p className="text-sm mt-1 opacity-90">Welcome to our culinary family!</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-300" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-300 shadow-lg shadow-gray-200/50 transition-all duration-300"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:shadow-orange-500/25 transform hover:scale-105 focus:scale-105 transition-all duration-300 font-semibold flex items-center justify-center gap-2 group"
                >
                  <span>Subscribe Now</span>
                  <div className="group-hover:translate-x-1 transition-transform duration-300">
                    →
                  </div>
                </button>
              </form>
            )}
            
            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50">
              <p className="text-xs text-gray-500 text-center">
                Join <span className="font-semibold text-orange-500">10,000+</span> food enthusiasts already with us
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Bar */}
        <div className="mt-16 border-t border-gray-200/50 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm space-y-4 md:space-y-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              © 2025 FlavorShare. Made with 
              <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
              for food lovers
            </span>
          </div>
          <div className="flex space-x-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item, idx) => (
              <a 
                key={idx} 
                href="#" 
                className="hover:text-orange-500 transition-all duration-300 hover:underline underline-offset-4 font-medium"
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { number: '10K+', label: 'Recipes' },
            { number: '50K+', label: 'Community' },
            { number: '100+', label: 'Chefs' },
            { number: '4.9', label: 'Rating' }
          ].map((stat, idx) => (
            <div key={idx} className="p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/30 hover:shadow-xl hover:shadow-gray-300/40 transition-all duration-500">
              <div className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-orange-600 bg-clip-text text-transparent">
                {stat.number}
              </div>
              <div className="text-xs text-gray-500 font-medium mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent"></div>
    </footer>
  );
};

export default Footer;