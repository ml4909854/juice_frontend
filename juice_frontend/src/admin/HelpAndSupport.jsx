// src/admin/HelpAndSupport.jsx
import React, { useState } from "react";

const HelpAndSupport = () => {
  const [activeTab, setActiveTab] = useState("faq");
  const [searchQuery, setSearchQuery] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "How do I add a new juice?",
          a: "Go to Juices Management and click on 'Add New Juice'. Fill in the details including name, category, price, stock, ingredients, benefits and upload images (max 6). Click 'Create Juice' to save."
        },
        {
          q: "How do I manage user roles?",
          a: "Navigate to Users Management, find the user you want to modify and use the role dropdown to change between 'User' and 'Admin' roles."
        },
        {
          q: "How do I update order status?",
          a: "In Orders Management, click on any order to expand details. Use the order status dropdown to update from 'placed' to 'processing', 'shipped', 'delivered', or 'cancelled'."
        }
      ]
    },
    {
      category: "Order Management",
      questions: [
        {
          q: "How do I process refunds?",
          a: "Contact the customer directly and process refund through your payment gateway. Update the order status to 'cancelled' and note the refund details in order notes."
        },
        {
          q: "Can I export orders data?",
          a: "Yes, in Orders Management, use the 'Export CSV' button to download all orders data for analysis or record keeping."
        }
      ]
    },
    {
      category: "User Management",
      questions: [
        {
          q: "How do I reset a user's password?",
          a: "Currently, users must use the 'Forgot Password' feature on the login page. Admin cannot directly reset passwords for security reasons."
        },
        {
          q: "Can I delete user accounts?",
          a: "Yes, in Users Management, click the delete button next to any user. Confirm the action to permanently remove the user account."
        }
      ]
    },
    {
      category: "Technical Issues",
      questions: [
        {
          q: "What to do if images don't upload?",
          a: "Ensure images are under 2MB and in JPG, PNG, or WEBP format. Check your internet connection and try again. If problem persists, contact support."
        },
        {
          q: "Why are changes not saving?",
          a: "Check your internet connection and ensure you're logged in. Try refreshing the page and making changes again. Clear browser cache if needed."
        }
      ]
    }
  ];

  const guides = [
    {
      title: "Admin Dashboard Overview",
      description: "Learn about the dashboard and key metrics",
      icon: "📊",
      link: "#"
    },
    {
      title: "Managing Juices",
      description: "Complete guide to juice CRUD operations",
      icon: "🧃",
      link: "#"
    },
    {
      title: "Order Processing",
      description: "Step-by-step order management guide",
      icon: "📦",
      link: "#"
    },
    {
      title: "User Management",
      description: "How to manage users and roles",
      icon: "👥",
      link: "#"
    }
  ];

  const handleContactChange = (e) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert("Support request submitted! We'll get back to you soon.");
    setContactForm({ name: "", email: "", subject: "", message: "" });
  };

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-green-500 p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Help & Support</h1>
          <p className="text-green-100 text-lg">Find answers to common questions and get support</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none text-lg"
          />
          <svg
            className="absolute left-4 top-4 w-6 h-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto px-6 py-2 gap-2">
            {[
              { id: "faq", label: "FAQ", icon: "❓" },
              { id: "guides", label: "Guides", icon: "📚" },
              { id: "contact", label: "Contact Support", icon: "📧" },
              { id: "system", label: "System Status", icon: "🖥️" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-green-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-8">
          {/* FAQ Tab */}
          {activeTab === "faq" && (
            <div className="space-y-8">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((category, idx) => (
                  <div key={idx} className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-800">{category.category}</h3>
                    <div className="space-y-3">
                      {category.questions.map((item, qIdx) => (
                        <div key={qIdx} className="border border-gray-200 rounded-lg overflow-hidden">
                          <details className="group">
                            <summary className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100">
                              <span className="font-medium text-gray-800">{item.q}</span>
                              <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </summary>
                            <div className="p-4 bg-white border-t border-gray-200">
                              <p className="text-gray-600">{item.a}</p>
                            </div>
                          </details>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}

          {/* Guides Tab */}
          {activeTab === "guides" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {guides.map((guide, idx) => (
                <a
                  key={idx}
                  href={guide.link}
                  className="block p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {guide.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">{guide.title}</h3>
                      <p className="text-sm text-gray-600">{guide.description}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* Contact Support Tab */}
          {activeTab === "contact" && (
            <form onSubmit={handleContactSubmit} className="max-w-2xl mx-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={contactForm.name}
                    onChange={handleContactChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={contactForm.subject}
                  onChange={handleContactChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  name="message"
                  value={contactForm.message}
                  onChange={handleContactChange}
                  required
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none"
                  placeholder="Describe your issue in detail..."
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Submit Request
                </button>
              </div>
            </form>
          )}

          {/* System Status Tab */}
          {activeTab === "system" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">System Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">API Server</span>
                  </div>
                  <span className="text-green-600">Operational</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Database</span>
                  </div>
                  <span className="text-green-600">Operational</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Authentication Service</span>
                  </div>
                  <span className="text-green-600">Operational</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="font-medium">Email Service</span>
                  </div>
                  <span className="text-yellow-600">Degraded</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpAndSupport;