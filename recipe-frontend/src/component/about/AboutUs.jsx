import { useState } from 'react';
import missionImg from '@/assets/mission-burger.jpg';
import communityImg from '@/assets/community-veggies.jpg';
import contributorsImg from '@/assets/contributors-drink.jpg';
import chefAmeliaImg from '@/assets/chef-amelia.jpg';
import chefOwenImg from '@/assets/chef-owen.jpg';
import chefLinImg from '@/assets/chef-lin.jpg';

const AboutUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('idle');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Form submitted:', formData);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus('error' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const locations = [
    { name: "San Francisco", area: "OUTER SUNSET" },
    { name: "Branch", area: "SUNSET DISTRICT" },
    { name: "Pacific Heights", area: "CHINA TOWN UNION SQUARE" },
    { name: "India Basin", area: "SHORELINE PARK" }
  ];

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-white via-orange-50/20 to-gray-50/30">
      {/* Enhanced Hero Section */}
     {/* Hero Section */}
<section className="container mx-auto px-6 py-20">
  <div className="max-w-3xl mx-auto text-center">
    <div className="inline-flex items-center justify-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
      Welcome to FlavorShare
    </div>
    <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-orange-700 bg-clip-text text-transparent">
      About Us
    </h1>
    <p className="text-xl text-gray-600 leading-relaxed">
      Sharing flavors, one recipe at a time. Join our community of passionate food lovers and culinary creators.
    </p>
  </div>
</section>


      {/* Enhanced Mission Cards */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { img: missionImg, title: "Our Mission", desc: "To connect food lovers and share culinary inspiration." },
            { img: communityImg, title: "Our Community", desc: "A vibrant community of chefs and food enthusiasts." },
            { img: contributorsImg, title: "Top Contributors", desc: "Meet the talented creators behind our top recipes." }
          ].map((card, index) => (
            <div key={index} className="group">
              <div className="relative h-72 mb-6 rounded-3xl overflow-hidden shadow-lg shadow-gray-200/50 group-hover:shadow-xl group-hover:shadow-orange-200/30 transition-all duration-500 border border-white">
                <img 
                  src={card.img} 
                  alt={card.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-white text-xl font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                    {card.title}
                  </h3>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                {card.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg font-light">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Enhanced Our Story Section */}
      <section className="bg-gradient-to-r from-white to-orange-50/20 border-y border-orange-100 py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 text-orange-600 mb-4">
              <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
              <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
              <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-gray-900 to-orange-700 bg-clip-text text-transparent">
              Our Story
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-12 max-w-3xl mx-auto font-light">
              FlavorShare was born from a simple idea: to create a space where food lovers can come together
              to share their culinary creations and inspire others. We believe that cooking is an art, and every recipe tells
              a story. Our platform is designed to make it easy for anyone to discover new dishes, connect with fellow foodies, 
              and express their passion for cooking.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              {[
                { value: "Founded in 2020", color: "bg-orange-500" },
                { value: "50K+ Recipes", color: "bg-orange-400" },
                { value: "100+ Countries", color: "bg-orange-300" }
              ].map((stat, index) => (
                <div key={index} className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl border border-orange-100 shadow-sm">
                  <div className={`w-3 h-3 ${stat.color} rounded-full`}></div>
                  <span className="text-gray-700 font-medium">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Meet Our Team */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-orange-700 bg-clip-text text-transparent">
              Meet Our Team
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg font-light">
              Passionate chefs and culinary experts dedicated to bringing you the best recipes and cooking inspiration.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { img: chefAmeliaImg, name: "Chef Amelia Rossi", desc: "Award-winning chef specializing in Italian cuisine." },
              { img: chefOwenImg, name: "Chef Owen Blake", desc: "Expert in modern American cuisine with a focus on sustainability." },
              { img: chefLinImg, name: "Chef Lin Mei", desc: "Master of Asian fusion, blending traditional and contemporary flavors." }
            ].map((chef, index) => (
              <div key={index} className="group text-center">
                <div className="relative w-56 h-56 mx-auto mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg"></div>
                  <div className="absolute inset-4 bg-white rounded-full shadow-inner"></div>
                  <img 
                    src={chef.img} 
                    alt={chef.name}
                    className="relative w-52 h-52 rounded-full object-cover border-4 border-white shadow-2xl transform group-hover:scale-105 transition-transform duration-500 mx-auto mt-2"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                  {chef.name}
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg font-light max-w-xs mx-auto">
                  {chef.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Contact Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900/30 text-white py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Get In Touch</h2>
              <p className="text-gray-300 max-w-2xl mx-auto text-lg font-light">
                Have questions or want to collaborate? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-10">
              {/* Enhanced Contact Form */}
              <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-10">
                  {submitStatus === 'success' && (
                    <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-200 text-center backdrop-blur-sm">
                      ✅ Message sent successfully! We'll get back to you soon.
                    </div>
                  )}
                  
                  {submitStatus === 'error' && (
                    <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-center backdrop-blur-sm">
                      ❌ Failed to send message. Please try again.
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-3 text-gray-200">Name</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your Name" 
                        className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white placeholder-gray-400 transition-all duration-300 backdrop-blur-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3 text-gray-200">Email</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Your Email" 
                        className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white placeholder-gray-400 transition-all duration-300 backdrop-blur-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-200">Subject</label>
                    <input 
                      type="text" 
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Subject" 
                      className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white placeholder-gray-400 transition-all duration-300 backdrop-blur-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-200">Message</label>
                    <textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Your Message" 
                      rows={6} 
                      className="w-full px-12 py-13 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white placeholder-gray-400 resize-none transition-all duration-300 backdrop-blur-sm"
                      required
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-orange-500/25"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending Message...
                      </div>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/10">
                  <p className="text-gray-300 text-center text-lg">
                    You can also reach us at{' '}
                    <a href="mailto:contact@flavorshare.com" className="text-orange-400 hover:text-orange-300 transition-colors font-semibold">
                      contact@flavorshare.com
                    </a>
                  </p>
                  <div className="flex justify-center space-x-8 mt-6">
                    {['Instagram', 'Twitter', 'Facebook'].map((social) => (
                      <a key={social} href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300 text-lg font-medium">
                        {social}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Enhanced Map & Locations */}
              <div className="space-y-8">
                <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl">
                  <h3 className="text-2xl font-bold mb-8 text-white">Our Locations</h3>
                  <div className="space-y-4">
                    {locations.map((location, index) => (
                      <div key={index} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-300 group cursor-pointer border border-white/5">
                        <div>
                          <h4 className="font-semibold text-white group-hover:text-orange-400 transition-colors duration-300 text-lg">
                            {location.name}
                          </h4>
                          <p className="text-gray-400 text-sm mt-1">{location.area}</p>
                        </div>
                        <div className="w-3 h-3 bg-orange-500 rounded-full group-hover:scale-150 transition-transform duration-300 group-hover:shadow-lg group-hover:shadow-orange-500/50"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enhanced Map Placeholder */}
                <div className="bg-gradient-to-br from-gray-800 to-orange-900/20 rounded-3xl p-8 border border-white/10 shadow-2xl h-80 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-pink-500/10"></div>
                  <div className="relative text-center z-10">
                    <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-orange-500/30">
                      <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-300 font-semibold text-xl mb-2">Interactive Map</p>
                    <p className="text-gray-500 text-lg">Multiple locations across the city</p>
                  </div>
                  
                  {/* Enhanced Map markers */}
                  {locations.map((_, index) => (
                    <div 
                      key={index}
                      className="absolute w-4 h-4 bg-orange-500 rounded-full animate-pulse shadow-lg shadow-orange-500/50"
                      style={{
                        top: `${20 + (index * 15)}%`,
                        left: `${30 + (index * 10)}%`,
                        animationDelay: `${index * 0.5}s`
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;