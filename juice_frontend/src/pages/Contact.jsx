// src/pages/Contact.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { PageLoader, ButtonLoader } from "../components/Loader";

const Contact = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("general");
  const [faqOpen, setFaqOpen] = useState({});

  // Page load animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // You'll need to create this endpoint: POST /contact
      // await axios.post(`${import.meta.env.VITE_BACKEND_URL}/contact`, formData);
      
      // Mock successful submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess("Thank you for contacting us! We'll get back to you soon.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
      setSelectedSubject("general");
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (index) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // FAQ data
  const faqs = [
    {
      question: "What are your delivery hours?",
      answer: "We deliver from 8:00 AM to 9:00 PM, 7 days a week. Same-day delivery is available for orders placed before 7 PM."
    },
    {
      question: "How long does delivery take?",
      answer: "We guarantee delivery within 30 minutes of placing your order. Our delivery partners are trained to ensure your juices reach you fresh."
    },
    {
      question: "Do you offer international delivery?",
      answer: "Currently, we only deliver within India. We're available in major cities including Bangalore, Mumbai, Delhi, Pune, and Hyderabad."
    },
    {
      question: "What is your refund policy?",
      answer: "If you're not satisfied with your order, please contact us within 2 hours of delivery. We'll either replace the items or issue a full refund."
    },
    {
      question: "Do you have sugar-free options?",
      answer: "Yes! We offer a range of sugar-free juices sweetened with natural alternatives like stevia. Check our 'Weight Loss' category."
    },
    {
      question: "How should I store the juices?",
      answer: "Our juices are best consumed fresh. If you need to store them, keep refrigerated and consume within 24 hours for best taste."
    }
  ];

  // Store locations
  const stores = [
    {
      city: "Bangalore",
      address: "123 MG Road, Indiranagar, Bangalore - 560038",
      phone: "+91 98765 43210",
      email: "bangalore@juiceshop.com",
      hours: "8:00 AM - 9:00 PM",
      map: "https://maps.google.com/?q=Indiranagar,Bangalore"
    },
    {
      city: "Mumbai",
      address: "456 Linking Road, Bandra West, Mumbai - 400050",
      phone: "+91 98765 43211",
      email: "mumbai@juiceshop.com",
      hours: "8:00 AM - 9:00 PM",
      map: "https://maps.google.com/?q=Bandra,Mumbai"
    },
    {
      city: "Delhi",
      address: "789 Connaught Place, New Delhi - 110001",
      phone: "+91 98765 43212",
      email: "delhi@juiceshop.com",
      hours: "8:00 AM - 9:00 PM",
      map: "https://maps.google.com/?q=Connaught+Place,Delhi"
    }
  ];

  if (pageLoading) return <PageLoader text="Loading contact page..." />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      
      {/* Hero Section */}
      <section className="relative h-[40vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1200&auto=format&fit=crop&q=80"
            alt="Contact us"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
        </div>
        
        <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center">
          <div className="text-white max-w-3xl animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4">
              Get in Touch
            </h1>
            <p className="text-lg sm:text-xl text-orange-100">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Phone */}
            <div className="bg-white rounded-xl shadow-lg p-6 text-center group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-600 transition-colors">
                <svg className="w-8 h-8 text-orange-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Call Us</h3>
              <p className="text-gray-600 mb-1">+91 98765 43210</p>
              <p className="text-gray-500 text-sm">24/7 Customer Support</p>
            </div>

            {/* Email */}
            <div className="bg-white rounded-xl shadow-lg p-6 text-center group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-600 transition-colors">
                <svg className="w-8 h-8 text-orange-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Email Us</h3>
              <p className="text-gray-600 mb-1">support@juiceshop.com</p>
              <p className="text-gray-500 text-sm">sales@juiceshop.com</p>
            </div>

            {/* WhatsApp */}
            <div className="bg-white rounded-xl shadow-lg p-6 text-center group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-600 transition-colors">
                <svg className="w-8 h-8 text-orange-600 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.97.57 3.88 1.64 5.5L2.1 22l4.72-1.56c1.58.96 3.41 1.48 5.32 1.48 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.92-9.91-9.92zm0 17.84c-1.62 0-3.2-.44-4.57-1.27l-.33-.2-3.12 1.03 1.05-3.02-.21-.35c-.88-1.4-1.35-3.02-1.35-4.7 0-4.61 3.76-8.37 8.37-8.37s8.37 3.76 8.37 8.37-3.76 8.37-8.37 8.37zm4.59-6.27c-.25-.12-1.48-.73-1.71-.81-.23-.08-.4-.12-.57.12-.17.25-.66.81-.81.98-.15.17-.3.19-.55.07-.97-.48-1.84-1.07-2.57-1.8-.48-.48-.86-1.04-1.12-1.64-.12-.25-.01-.39.09-.52.09-.11.2-.29.29-.44.1-.15.13-.25.2-.42.07-.17.03-.31-.02-.44-.05-.12-.57-1.37-.78-1.88-.21-.51-.42-.44-.57-.45-.15-.01-.32-.01-.49-.01s-.45.06-.68.31c-.23.25-.89.87-.89 2.12 0 1.25.91 2.46 1.04 2.63.13.17 1.79 2.74 4.34 3.75.61.24 1.08.39 1.45.5.61.18 1.16.15 1.6.09.49-.06 1.48-.6 1.69-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28z"/>
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">WhatsApp</h3>
              <p className="text-gray-600 mb-1">+91 98765 43210</p>
              <p className="text-gray-500 text-sm">Quick response on WhatsApp</p>
            </div>

            {/* Live Chat */}
            <div className="bg-white rounded-xl shadow-lg p-6 text-center group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-600 transition-colors">
                <svg className="w-8 h-8 text-orange-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Live Chat</h3>
              <p className="text-gray-600 mb-1">Chat with us now</p>
              <p className="text-gray-500 text-sm">Available 8 AM - 9 PM</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                Send Us a Message
              </h2>
              <p className="text-gray-600 mb-8">
                Have a question or feedback? Fill out the form and we'll get back to you within 24 hours.
              </p>

              {success && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-600 text-sm">{success}</p>
                </div>
              )}

              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="relative group">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all peer"
                      placeholder=" "
                    />
                    <label className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-orange-600">
                      Your Name *
                    </label>
                  </div>

                  {/* Email */}
                  <div className="relative group">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all peer"
                      placeholder=" "
                    />
                    <label className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-orange-600">
                      Email Address *
                    </label>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="relative group">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all peer"
                      placeholder=" "
                    />
                    <label className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-orange-600">
                      Phone Number
                    </label>
                  </div>

                  {/* Subject Dropdown */}
                  <div className="relative group">
                    <select
                      name="subject"
                      value={selectedSubject}
                      onChange={(e) => {
                        setSelectedSubject(e.target.value);
                        setFormData({...formData, subject: e.target.options[e.target.selectedIndex].text});
                      }}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none appearance-none cursor-pointer"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="order">Order Related</option>
                      <option value="delivery">Delivery Issue</option>
                      <option value="feedback">Feedback</option>
                      <option value="complaint">Complaint</option>
                      <option value="partnership">Partnership</option>
                    </select>
                    <label className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-500">
                      Subject
                    </label>
                  </div>
                </div>

                {/* Message */}
                <div className="relative group">
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all peer"
                    placeholder=" "
                  ></textarea>
                  <label className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-orange-600">
                    Your Message *
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 disabled:opacity-50"
                >
                  {loading ? <ButtonLoader /> : "Send Message"}
                </button>
              </form>
            </div>

            {/* Map */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                  Visit Our Store
                </h2>
                <p className="text-gray-600 mb-4">
                  Drop by our flagship store in Bangalore. We'd love to meet you!
                </p>
              </div>
              
              <div className="bg-gray-200 rounded-xl overflow-hidden h-[400px] relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.977845472635!2d77.640857!3d12.971599!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae16a0e1b3b3b3%3A0x1b3b3b3b3b3b3b3b!2sIndiranagar%2C%20Bangalore!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  title="Store Location"
                  className="absolute inset-0"
                ></iframe>
              </div>

              {/* Store Hours Card */}
              <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Store Hours
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monday - Saturday</span>
                    <span className="font-semibold">8:00 AM - 9:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sunday</span>
                    <span className="font-semibold">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Public Holidays</span>
                    <span className="font-semibold">10:00 AM - 4:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Store Locations */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
            Our Locations
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Visit us at any of our stores across India
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {stores.map((store, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg">{store.city}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-3">{store.address}</p>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {store.phone}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {store.email}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {store.hours}
                  </p>
                </div>
                <a
                  href={store.map}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-800 font-medium"
                >
                  Get Directions
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 text-center mb-12">
            Find quick answers to common questions
          </p>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-orange-50 transition-colors"
                >
                  <span className="font-semibold text-gray-800">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-orange-600 transform transition-transform ${faqOpen[index] ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {faqOpen[index] && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-orange-500">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Order?
          </h2>
          <p className="text-orange-100 mb-8 text-lg">
            Browse our menu and get fresh juices delivered in 30 minutes
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/juices"
              className="px-8 py-4 bg-white text-orange-600 rounded-lg font-bold hover:bg-orange-50 transition-colors shadow-xl"
            >
              Shop Now
            </Link>
            <Link
              to="/about"
              className="px-8 py-4 border-2 border-white text-white rounded-lg font-bold hover:bg-white hover:text-orange-600 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Contact;