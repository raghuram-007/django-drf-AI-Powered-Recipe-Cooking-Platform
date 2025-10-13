import React from "react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)]"></div>

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8 w-full">
        <div className="text-center lg:text-left space-y-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-5 py-3 shadow-sm border border-slate-200 mx-auto lg:mx-0">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-sm font-medium text-slate-700">
              Trusted by 10,000+ culinary enthusiasts
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
            Elevate Your{" "}
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Culinary
            </span>{" "}
            Journey
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
            Discover expertly crafted recipes from a global community of chefs and home cooks. 
            Transform your cooking experience with our curated collection.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-6">
            <button className="bg-slate-900 text-white px-8 py-4 rounded-xl hover:bg-slate-800 transition-all duration-300 font-semibold text-base shadow-lg hover:shadow-xl transform hover:scale-105 border border-slate-900">
              Explore Recipes
            </button>

            <button className="bg-white text-slate-700 px-8 py-4 rounded-xl hover:bg-slate-50 transition-all duration-300 font-semibold text-base shadow-sm hover:shadow-md transform hover:scale-105 border border-slate-300">
              Join Community
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-8 pt-8 border-t border-slate-200 mt-8">
            {[
              { number: "500+", label: "Expert Recipes" },
              { number: "10K+", label: "Active Members" },
              { number: "4.9/5", label: "Rating" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-slate-900">{stat.number}</div>
                <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
     
    </section>
  );
};

export default Hero;
