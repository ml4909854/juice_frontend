// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  // Auto slide change
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll("[data-observe]").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Hero Slider Images
  const heroSlides = [
    {
      url: "https://plus.unsplash.com/premium_photo-1667543228378-ec4478ab2845?w=600&auto=format&fit=crop&q=60",
      title: "Fresh Juice Delight",
      subtitle: "Start your day with natural energy"
    },
    {
      url: "https://images.unsplash.com/photo-1551198297-094dd136d3e9?w=600&auto=format&fit=crop&q=60",
      title: "Tropical Bliss",
      subtitle: "Escape to paradise with every sip"
    },
    {
      url: "https://images.unsplash.com/photo-1583577612013-4fecf7bf8f13?w=600&auto=format&fit=crop&q=60",
      title: "Berry Explosion",
      subtitle: "Packed with antioxidants"
    },
    {
      url: "https://images.unsplash.com/photo-1629390207001-0098164f72d9?w=600&auto=format&fit=crop&q=60",
      title: "Citrus Fresh",
      subtitle: "Vitamin C boost for immunity"
    },
    {
      url: "https://plus.unsplash.com/premium_photo-1676642615413-e18b508a0ff3?w=600&auto=format&fit=crop&q=60",
      title: "Green Detox",
      subtitle: "Cleanse your body naturally"
    },
    {
      url: "https://images.unsplash.com/photo-1629389937220-6076fb30d2ff?w=600&auto=format&fit=crop&q=60",
      title: "Mango Magic",
      subtitle: "King of fruits in every drop"
    },
    {
      url: "https://plus.unsplash.com/premium_photo-1714203960838-6b1595fc008b?w=600&auto=format&fit=crop&q=60",
      title: "Watermelon Cooler",
      subtitle: "Summer refreshment"
    },
    {
      url: "https://plus.unsplash.com/premium_photo-1661955490854-af2d491c9384?w=600&auto=format&fit=crop&q=60",
      title: "Pineapple Punch",
      subtitle: "Tropical energy boost"
    },
  ];

  // Horizontal Scroll Gallery Images
  const scrollImages = [
    {
      url: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&auto=format&fit=crop&q=60",
      title: "Orange Fresh"
    },
    {
      url: "https://plus.unsplash.com/premium_photo-1663091544172-794c537af00c?w=600&auto=format&fit=crop&q=60",
      title: "Mixed Berries"
    },
    {
      url: "https://images.unsplash.com/photo-1583577612013-4fecf7bf8f13?w=600&auto=format&fit=crop&q=60",
      title: "Strawberry Bliss"
    },
    {
      url: "https://plus.unsplash.com/premium_photo-1674595248950-7abfa035b118?w=600&auto=format&fit=crop&q=60",
      title: "Tropical Punch"
    },
    {
      url: "https://images.unsplash.com/flagged/photo-1557753478-b9fb74f39eb5?w=600&auto=format&fit=crop&q=60",
      title: "Green Goodness"
    },
    {
      url: "https://images.unsplash.com/photo-1618046364546-81e9d03d39a6?w=600&auto=format&fit=crop&q=60",
      title: "Carrot Beetroot"
    },
    {
      url: "https://images.unsplash.com/photo-1653542772393-71ffa417b1c4?w=600&auto=format&fit=crop&q=60",
      title: "Mint Lemonade"
    },
    {
      url: "https://images.unsplash.com/photo-1657101455328-6821c90b0ad3?w=600&auto=format&fit=crop&q=60",
      title: "Pomegranate"
    },
    {
      url: "https://images.unsplash.com/photo-1607690506833-498e04ab3ffa?w=600&auto=format&fit=crop&q=60",
      title: "Grape Delight"
    },
    {
      url: "https://images.unsplash.com/photo-1722663160036-b584469b3577?w=600&auto=format&fit=crop&q=60",
      title: "Cucumber Cooler"
    },
  ];

  // Featured Juices with Energy Level
  const featuredJuices = [
    {
      name: "Apple Juice",
      image: "https://images.unsplash.com/photo-1605199910378-edb0c0709ab4?w=600&auto=format&fit=crop&q=60",
      taste: "Sweet & Fresh",
      energy: 4,
      benefits: [
        "Heart healthy",
        "Weight management",
        "Skin glowing",
        "Boosts immunity"
      ],
      bg: "from-red-50 to-red-100",
      border: "border-red-200",
      text: "text-red-600"
    },
    {
      name: "Orange Juice",
      image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&auto=format&fit=crop&q=60",
      taste: "Tangy & Fresh",
      energy: 5,
      benefits: [
        "Rich in Vitamin C",
        "Strong immunity",
        "Fights cold & cough",
        "Glowing skin"
      ],
      bg: "from-orange-50 to-orange-100",
      border: "border-orange-200",
      text: "text-orange-600"
    },
    {
      name: "Banana Shake",
      image: "https://images.unsplash.com/photo-1685967836529-b0e8d6938227?w=600&auto=format&fit=crop&q=60",
      taste: "Sweet & Creamy",
      energy: 5,
      benefits: [
        "Instant energy",
        "Muscle building",
        "Good for digestion",
        "Weight gain"
      ],
      bg: "from-yellow-50 to-yellow-100",
      border: "border-yellow-200",
      text: "text-yellow-600"
    },
  ];

  // Gallery Images
  const galleryImages = [
    "https://plus.unsplash.com/premium_photo-1663126827264-409d695e0be7?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1618724980108-a4d3856fd8f5?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1614707585284-9cb9fc018387?w=600&auto=format&fit=crop&q=60",
    "https://plus.unsplash.com/premium_photo-1675667756988-e73d68e5abf1?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1507120366498-4656eaece7fa?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1615478503562-ec2d8aa0e24e?w=600&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1506802913710-40e2e66339c9?w=600&auto=format&fit=crop&q=60",
  ];

  // User Reviews with Indian Names (English)
  const reviews = [
    {
      name: "Rajesh Kumar",
      location: "Delhi",
      image: "https://images.unsplash.com/photo-1698510047345-ff32de8a3b74?w=600&auto=format&fit=crop&q=60",
      rating: 5,
      text: "Absolutely amazing juice! I drink it every morning, my energy levels have increased significantly. The orange juice is simply fantastic.",
      juice: "Orange Juice"
    },
    {
      name: "Priya Singh",
      location: "Mumbai",
      image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600&auto=format&fit=crop&q=60",
      rating: 5,
      text: "I tried the Green Detox juice for the first time. Within a week I could see the difference. My skin is glowing!",
      juice: "Green Detox"
    },
    {
      name: "Amit Sharma",
      location: "Bangalore",
      image: "https://images.unsplash.com/photo-1558203728-00f45181dd84?w=600&auto=format&fit=crop&q=60",
      rating: 4,
      text: "I drink Banana Shake after gym. It helps a lot in muscle recovery. The taste is also amazing.",
      juice: "Banana Shake"
    },
    {
      name: "Sneha Patel",
      location: "Ahmedabad",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=60",
      rating: 5,
      text: "My kids love it! They've stopped asking for cold drinks and now prefer healthy juices. Watermelon Cooler is a hit!",
      juice: "Watermelon Cooler"
    },
    {
      name: "Vikash Gupta",
      location: "Lucknow",
      image: "https://media.istockphoto.com/id/1437816897/photo/business-woman-manager-or-human-resources-portrait-for-career-success-company-we-are-hiring.webp?a=1&b=1&s=612x612&w=0&k=20&c=u5RPl326UFf1oyrM1iLFJtqdQ3K28TdBdSaSPKeCrdc=",
      rating: 5,
      text: "The Apple juice tastes just like homemade. The sugar-free option is great for diabetics like me.",
      juice: "Apple Juice"
    },
    {
      name: "Pooja Yadav",
      location: "Pune",
      image: "https://images.unsplash.com/photo-1722322426803-101270837197?w=600&auto=format&fit=crop&q=60",
      rating: 4,
      text: "Great quality and freshness. The packaging is excellent and delivery is always on time. Highly recommended!",
      juice: "Mixed Fruit"
    },
    {
      name: "Suresh Nair",
      location: "Chennai",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=60",
      rating: 5,
      text: "The best juice shop in town! I've tried almost all flavors and each one is unique and delicious.",
      juice: "Pineapple Punch"
    },
    {
      name: "Kavita Reddy",
      location: "Hyderabad",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&auto=format&fit=crop&q=60",
      rating: 5,
      text: "Perfect for my morning detox routine. Fresh, pure and no added sugar. Just what I was looking for!",
      juice: "Green Detox"
    },
  ];

  // Helper for star rating
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      
      {/* ===== HERO SECTION WITH DOTS SLIDER ===== */}
      <section className="relative h-[70vh] sm:h-[80vh] lg:h-[90vh] overflow-hidden">
        {/* Slides */}
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="absolute inset-0 bg-black/40 z-10"></div>
            <img
              src={slide.url}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 z-20 flex items-center justify-center text-center">
              <div className="text-white px-4 animate-fade-in-up">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-4 drop-shadow-lg">
                  {slide.title}
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl mb-8 drop-shadow-md">
                  {slide.subtitle}
                </p>
                <Link
                  to="/juices"
                  className="inline-block bg-orange-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Dots Navigation */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 ${
                index === currentSlide
                  ? 'w-8 h-3 bg-orange-600 rounded-full'
                  : 'w-3 h-3 bg-white/50 hover:bg-white rounded-full'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Arrow Navigation */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-2 rounded-full transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-2 rounded-full transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </section>

      {/* ===== HORIZONTAL SCROLL GALLERY ===== */}
      <section className="py-16 px-4 max-w-7xl mx-auto" data-observe="true" id="scroll-gallery">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black mb-4 bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
            Our Fresh Collection
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Swipe through our delicious range of freshly squeezed juices
          </p>
        </div>

        <div className="relative">
          <div className="flex overflow-x-auto gap-4 pb-6 scrollbar-hide snap-x snap-mandatory">
            {scrollImages.map((image, index) => (
              <div
                key={index}
                className="flex-none w-64 sm:w-72 md:w-80 snap-start group cursor-pointer"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-xl font-bold">{image.title}</h3>
                    <Link to="/juices" className="text-sm text-orange-300 hover:text-orange-400">
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Gradient fade on edges */}
          <div className="absolute top-0 left-0 h-full w-16 bg-gradient-to-r from-orange-50 to-transparent pointer-events-none"></div>
          <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-orange-50 to-transparent pointer-events-none"></div>
        </div>
      </section>

      {/* ===== FEATURED JUICES WITH ENERGY LEVEL ===== */}
      <section className="py-16 px-4 bg-gradient-to-b from-white to-orange-50" data-observe="true" id="featured">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black mb-4 bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
              Most Popular Juices
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Handpicked for their taste and health benefits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredJuices.map((juice, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${juice.bg} rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 overflow-hidden group border ${juice.border}`}
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={juice.image}
                    alt={juice.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
                    <span className="font-bold text-sm">{juice.taste}</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{juice.name}</h3>
                  
                  {/* Energy Level */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-600">Energy Level:</span>
                      <span className={`font-bold ${juice.text}`}>{juice.energy}/5</span>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 flex-1 rounded-full ${
                            i < juice.energy ? 'bg-orange-500' : 'bg-gray-300'
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2 mb-6">
                    {juice.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    to="/juices"
                    className={`block text-center ${juice.text} border-2 ${juice.border} hover:bg-orange-600 hover:text-white hover:border-orange-600 font-semibold py-3 rounded-xl transition-all duration-300`}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== GALLERY GRID ===== */}
      <section className="py-16 px-4 max-w-7xl mx-auto" data-observe="true" id="gallery">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black mb-4 bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
            Juice Gallery
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A glimpse of our fresh and healthy creations
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className={`relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 ${
                index === 0 || index === 7 ? 'col-span-2 row-span-2' : ''
              }`}
            >
              <img
                src={image}
                alt={`Juice ${index + 1}`}
                className="w-full h-full object-cover aspect-square group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-sm font-medium">Fresh & Healthy</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CUSTOMER REVIEWS ===== */}
      <section className="py-16 px-4 bg-gradient-to-b from-orange-50 to-white" data-observe="true" id="reviews">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black mb-4 bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
              What Our Customers Say
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real reviews from real people across India
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.slice(0, 8).map((review, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={review.image}
                    alt={review.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-orange-500"
                  />
                  <div>
                    <h3 className="font-bold text-gray-800">{review.name}</h3>
                    <p className="text-sm text-gray-500">{review.location}</p>
                  </div>
                </div>

                <div className="flex mb-3">
                  {renderStars(review.rating)}
                </div>

                <p className="text-gray-600 text-sm mb-3 italic">"{review.text}"</p>
                
                <p className="text-xs font-medium text-orange-600">
                  {review.juice}
                </p>
              </div>
            ))}
          </div>

          {/* View All Reviews Button */}
          <div className="text-center mt-12">
            <Link
              to="/reviews"
              className="inline-block bg-orange-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-700 transition-all transform hover:scale-105 shadow-lg"
            >
              View All Reviews
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="py-20 px-4 relative overflow-hidden" data-observe="true" id="cta">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=1200&auto=format&fit=crop&q=60"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-900/90 to-orange-600/90"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl sm:text-5xl font-black mb-6">
            Ready to Try Our Fresh Juices?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Order now and get 20% off on your first purchase
          </p>
          <Link
            to="/juices"
            className="inline-block bg-white text-orange-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-orange-50 transition-all transform hover:scale-105 shadow-2xl"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Add custom animations to your index.css */}
    </div>
  );
};

export default Home;