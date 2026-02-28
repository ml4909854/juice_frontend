// src/pages/About.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PageLoader } from "../components/Loader";

const About = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("story");
  const [counts, setCounts] = useState({
    customers: 0,
    juices: 0,
    deliveries: 0,
    reviews: 0
  });

  // Page load animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Animate counters
  useEffect(() => {
    if (!pageLoading) {
      const targetCounts = {
        customers: 15000,
        juices: 50,
        deliveries: 25000,
        reviews: 8000
      };

      const interval = setInterval(() => {
        setCounts(prev => {
          const newCounts = { ...prev };
          let completed = true;

          Object.keys(targetCounts).forEach(key => {
            if (prev[key] < targetCounts[key]) {
              completed = false;
              newCounts[key] = Math.min(prev[key] + Math.ceil(targetCounts[key] / 50), targetCounts[key]);
            }
          });

          if (completed) clearInterval(interval);
          return newCounts;
        });
      }, 30);

      return () => clearInterval(interval);
    }
  }, [pageLoading]);

  // Team members data
  const teamMembers = [
    {
      name: "Rajesh Kumar",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1558203728-00f45181dd84?w=400&auto=format&fit=crop&q=60",
      bio: "Former nutritionist with a passion for healthy living. Founded JuiceShop to make fresh juices accessible to everyone.",
      social: {
        twitter: "#",
        linkedin: "#",
        email: "rajesh@juiceshop.com"
      }
    },
    {
      name: "Priya Singh",
      role: "Head of Nutrition",
      image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=60",
      bio: "Certified nutritionist with 10+ years of experience. Creates all our unique juice recipes.",
      social: {
        twitter: "#",
        linkedin: "#",
        email: "priya@juiceshop.com"
      }
    },
    {
      name: "Amit Sharma",
      role: "Operations Manager",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60",
      bio: "Ensures every juice reaches you fresh and on time. Logistics expert with a green thumb.",
      social: {
        twitter: "#",
        linkedin: "#",
        email: "amit@juiceshop.com"
      }
    },
    {
      name: "Kavita Reddy",
      role: "Customer Happiness",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=60",
      bio: "Makes sure every customer leaves with a smile. Your go-to person for any questions.",
      social: {
        twitter: "#",
        linkedin: "#",
        email: "kavita@juiceshop.com"
      }
    }
  ];

  // Values data
  const values = [
    {
      icon: "🌱",
      title: "100% Natural",
      description: "No preservatives, no artificial flavors. Just pure, natural ingredients."
    },
    {
      icon: "🚚",
      title: "Fresh Delivery",
      description: "Juices prepared fresh and delivered within 30 minutes of ordering."
    },
    {
      icon: "🌍",
      title: "Sustainable",
      description: "Eco-friendly packaging and support for local farmers."
    },
    {
      icon: "❤️",
      title: "Made with Love",
      description: "Every juice is crafted with care and passion for your health."
    }
  ];

  // Milestones data
  const milestones = [
    {
      year: "2020",
      title: "The Beginning",
      description: "Started from a small kitchen in Bangalore with just 5 juice recipes."
    },
    {
      year: "2021",
      title: "First Store",
      description: "Opened our first physical store in Indiranagar, Bangalore."
    },
    {
      year: "2022",
      title: "Expansion",
      description: "Expanded to 5 cities across India with 20+ stores."
    },
    {
      year: "2023",
      title: "App Launch",
      description: "Launched our mobile app, making ordering even easier."
    },
    {
      year: "2024",
      title: "100K Customers",
      description: "Served over 100,000 happy customers across the country."
    }
  ];

  if (pageLoading) return <PageLoader text="Loading about us..." />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      
      {/* Hero Section */}
      <section className="relative h-[50vh] sm:h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1542838686-1c8ba0b6d3f4?w=1200&auto=format&fit=crop&q=80"
            alt="Fresh fruits"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
        </div>
        
        <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center">
          <div className="text-white max-w-3xl animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4">
              Our Story
            </h1>
            <p className="text-lg sm:text-xl text-orange-100 mb-6">
              From a small kitchen to your doorstep – bringing fresh, healthy juices to India
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/juices"
                className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
              >
                Explore Our Juices
              </Link>
              <Link
                to="/contact"
                className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">
                {counts.customers.toLocaleString()}+
              </div>
              <p className="text-gray-600">Happy Customers</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">
                {counts.juices}+
              </div>
              <p className="text-gray-600">Juice Varieties</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">
                {counts.deliveries.toLocaleString()}+
              </div>
              <p className="text-gray-600">Deliveries</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">
                {counts.reviews.toLocaleString()}+
              </div>
              <p className="text-gray-600">5-Star Reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Tab Buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {[
              { id: "story", label: "Our Story", icon: "📖" },
              { id: "mission", label: "Mission & Vision", icon: "🎯" },
              { id: "values", label: "Our Values", icon: "💎" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-orange-600 text-white shadow-lg scale-105"
                    : "bg-white text-gray-600 hover:bg-orange-50"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            {activeTab === "story" && (
              <div className="animate-fadeIn">
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                  How It All Began
                </h2>
                <div className="prose max-w-none">
                  <p className="text-gray-600 mb-4">
                    It all started in 2020, during the pandemic, when our founder Rajesh realized how difficult it was to find fresh, healthy juices. With a small blender and a passion for nutrition, he started making juices for his neighbors.
                  </p>
                  <p className="text-gray-600 mb-4">
                    Word spread quickly, and soon we were delivering dozens of bottles every day. Today, JuiceShop has grown into a beloved brand with stores across India, but our philosophy remains the same – every juice must be fresh, natural, and made with love.
                  </p>
                  <p className="text-gray-600">
                    We work directly with local farmers to source the finest fruits and vegetables. No middlemen, no compromises. Just pure, delicious juice delivered to your doorstep within 30 minutes.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "mission" && (
              <div className="animate-fadeIn">
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                  Our Mission & Vision
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-orange-50 rounded-xl p-6">
                    <div className="text-4xl mb-4">🎯</div>
                    <h3 className="text-xl font-bold mb-3">Our Mission</h3>
                    <p className="text-gray-600">
                      To make healthy living accessible and enjoyable for everyone. We're on a mission to replace sugary drinks with fresh, natural alternatives that taste amazing and nourish your body.
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-6">
                    <div className="text-4xl mb-4">👁️</div>
                    <h3 className="text-xl font-bold mb-3">Our Vision</h3>
                    <p className="text-gray-600">
                      To become India's most trusted healthy beverage brand, with a presence in every city, while promoting sustainable farming and a healthier lifestyle for all.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "values" && (
              <div className="animate-fadeIn">
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                  What We Stand For
                </h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  {values.map((value, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="text-3xl">{value.icon}</div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">{value.title}</h3>
                        <p className="text-gray-600">{value.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
            Our Journey
          </h2>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-orange-200 hidden md:block"></div>
            
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex flex-col md:flex-row ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className="md:w-1/2"></div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-orange-600 rounded-full hidden md:block"></div>
                  <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                    <div className="bg-orange-50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                      <span className="text-sm font-semibold text-orange-600">{milestone.year}</span>
                      <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
            Meet Our Team
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            The passionate people behind your favorite juices
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="group">
                <div className="relative mb-4 overflow-hidden rounded-2xl">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex justify-center gap-3">
                      <a href={member.social.twitter} className="hover:text-orange-400">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.184-.896-.959-2.173-1.558-3.591-1.558-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 14-7.503 14-14 0-.21-.005-.418-.015-.626.961-.689 1.8-1.56 2.46-2.548z"/>
                        </svg>
                      </a>
                      <a href={member.social.linkedin} className="hover:text-orange-400">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0zM7.08 20.45H3.56V8.95h3.52v11.5zM5.32 7.45c-1.13 0-2.05-.92-2.05-2.05 0-1.13.92-2.05 2.05-2.05 1.13 0 2.05.92 2.05 2.05 0 1.13-.92 2.05-2.05 2.05zM20.45 20.45h-3.52v-5.6c0-1.34-.02-3.06-1.86-3.06-1.86 0-2.15 1.45-2.15 2.95v5.71H9.4V8.95h3.38v1.56h.05c.47-.89 1.63-1.83 3.36-1.83 3.59 0 4.26 2.36 4.26 5.43v6.34z"/>
                        </svg>
                      </a>
                      <a href={`mailto:${member.social.email}`} className="hover:text-orange-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-lg text-center">{member.name}</h3>
                <p className="text-orange-600 text-sm text-center mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm text-center">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-orange-500">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Try Our Juices?
          </h2>
          <p className="text-orange-100 mb-8 text-lg">
            Join thousands of happy customers enjoying fresh, healthy juices every day
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/juices"
              className="px-8 py-4 bg-white text-orange-600 rounded-lg font-bold hover:bg-orange-50 transition-colors shadow-xl"
            >
              Shop Now
            </Link>
            <Link
              to="/contact"
              className="px-8 py-4 border-2 border-white text-white rounded-lg font-bold hover:bg-white hover:text-orange-600 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default About;