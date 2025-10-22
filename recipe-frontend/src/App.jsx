
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Components
import Navbar from "./component/header/Navbar";
import Footer from "./component/footer/Footer";

// Pages
import HomePage from "./component/homepage/Homepage";
import AboutUs from "./component/about/AboutUs";
import SignupForm from "./component/SignupForm";
import LoginForm from "./component/LoginForm";
import RecipeList from "./component/RecipeList";
import RecipeDetail from "./component/pages/RecipeDetail";
import AddRecipe from "./component/pages/AddRecipe";
import EditRecipe from "./component/pages/EditRecipe";
import CategoryRecipie from "./component/category/CategoryRecipie";
import Dashboard from "./component/pages/Dashboard";
import Feed from './component/Feed';
import Notifications from './component/Notifications';
import DiscoverRecipes from "./component/pages/DiscoverRecipes";
import VideoReelsFeed from './component/VideoReelsFeed';
import GuidedCooking from './component/GuidedCooking';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


// Protected Route Component
const RequireAuth = ({ children }) => {
  return localStorage.getItem("access") ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Navbar />
      <div className="pt-6 min-h-[80vh]">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/recipe" element={<RecipeList />} />
          <Route path="/recipe/:id" element={<RequireAuth><RecipeDetail /></RequireAuth>} />
          <Route path="/add-recipe" element={<AddRecipe />} />
          <Route path="/edit-recipe/:id" element={<EditRecipe />} />
          <Route path="/category/:categoryId" element={ <RequireAuth><CategoryRecipie /></RequireAuth>} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/discover" element={<DiscoverRecipes/>}/>
           <Route path="/reels" element={<VideoReelsFeed />} />
           <Route path="/guided-cooking" element={<GuidedCooking />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />

        
        </Routes>
         <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover
      />
      </div>
      <Footer />
    </Router>
  );
}

export default App;
