import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaChurch, FaUsers, FaGlobe, FaFileAlt, FaArrowRight, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';

const Welcome = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const navigate = useNavigate();
    
    const slides = [
        { 
            image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1920&q=80', 
            title: 'Heaven\'s Glory Awaits', 
            subtitle: 'Discover the eternal beauty of God\'s kingdom and His perfect love' 
        },
        { 
            image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&q=80', 
            title: 'Peace Beyond Understanding', 
            subtitle: 'Experience divine tranquility in the presence of our Creator' 
        },
        { 
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80', 
            title: 'Majesty of Creation', 
            subtitle: 'Witness the breathtaking wonders that reflect God\'s infinite power' 
        },
        { 
            image: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1920&q=80', 
            title: 'Journey to Eternity', 
            subtitle: 'Walk the path of faith towards the magnificent gates of paradise' 
        }
    ];

    // Check maintenance mode on component mount
    useEffect(() => {
        const checkMaintenance = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                await axios.get(`${apiUrl}/api/auth/check`);
            } catch (err) {
                if (err.response?.status === 503 && err.response?.data?.maintenanceMode) {
                    navigate('/maintenance');
                }
            }
        };
        checkMaintenance();
    }, [navigate]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <div className="bg-gray-900">
            {/* Hero Section with Background Slideshow */}
            <div className="min-h-screen relative overflow-hidden">
                {/* Background Slideshow */}
                <div className="absolute inset-0 z-0">
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ${
                                index === currentSlide ? 'opacity-100' : 'opacity-0'
                            }`}
                        style={{ pointerEvents: 'none' }}
                    >
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
                    </div>
                ))}
            </div>

            {/* Navigation */}
            <nav className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <FaChurch className="text-white text-2xl sm:text-3xl drop-shadow-lg" />
                        <span className="text-lg sm:text-2xl font-bold text-white drop-shadow-lg">Ministry Reports</span>
                    </div>
                    <div className="flex gap-2 sm:gap-4">
                        <Link 
                            to="/login" 
                            className="px-3 sm:px-6 py-2 text-sm sm:text-base text-white hover:text-indigo-200 font-medium transition-colors drop-shadow-lg"
                        >
                            Sign In
                        </Link>
                        <Link 
                            to="/register" 
                            className="px-3 sm:px-6 py-2 text-sm sm:text-base bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/30 transition-all shadow-lg hover:shadow-xl border border-white/30"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Content */}
            <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20 min-h-[calc(100vh-100px)] flex items-center">
                <div className="max-w-4xl mx-auto text-center w-full">
                    <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 drop-shadow-2xl animate-fade-in px-2">
                        {slides[currentSlide].title}
                    </h1>
                    <p className="text-lg sm:text-2xl md:text-3xl text-white/90 mb-3 sm:mb-4 drop-shadow-lg font-light px-2">
                        {slides[currentSlide].subtitle}
                    </p>
                    <p className="text-base sm:text-xl text-white/80 mb-6 sm:mb-10 max-w-2xl mx-auto drop-shadow-lg px-4">
                        Empower your ministry with a comprehensive reporting platform designed for 
                        leaders and members worldwide. Track progress, share insights, and stay connected.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
                        <Link 
                            to="/register" 
                            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all shadow-2xl hover:shadow-3xl flex items-center justify-center gap-2 text-base sm:text-lg font-bold"
                        >
                            Start Free <FaArrowRight />
                        </Link>
                        <a 
                            href="#features" 
                            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/30 transition-all shadow-lg border-2 border-white/50 text-base sm:text-lg font-medium text-center"
                        >
                            Learn More
                        </a>
                    </div>

                    {/* Slide Indicators */}
                    <div className="flex justify-center gap-2 mt-8 sm:mt-12">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`h-2 rounded-full transition-all ${
                                    index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Navigation Arrows - Hidden on mobile */}
                    <button
                        onClick={prevSlide}
                        className="hidden md:block absolute left-2 lg:left-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 backdrop-blur-md text-white p-3 lg:p-4 rounded-full hover:bg-white/30 transition-all shadow-lg"
                    >
                        <FaChevronLeft size={20} className="lg:text-2xl" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="hidden md:block absolute right-2 lg:right-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 backdrop-blur-md text-white p-3 lg:p-4 rounded-full hover:bg-white/30 transition-all shadow-lg"
                    >
                        <FaChevronRight size={20} className="lg:text-2xl" />
                    </button>
                </div>
            </div>
            </div>
            {/* End of Hero Section */}

            {/* Features Section */}
            <div id="features" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10 sm:mb-16">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
                            Everything You Need
                        </h2>
                        <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                            A complete solution for managing ministry activities and reports across the globe
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto">
                        <div className="p-6 sm:p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg hover:shadow-xl transition-all">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-600 rounded-xl flex items-center justify-center mb-4">
                                <FaFileAlt className="text-xl sm:text-2xl text-white" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Easy Reporting</h3>
                            <p className="text-sm sm:text-base text-gray-600">
                                Submit detailed reports with attachments and track your ministry activities effortlessly.
                            </p>
                        </div>

                        <div className="p-6 sm:p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg hover:shadow-xl transition-all">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                                <FaUsers className="text-xl sm:text-2xl text-white" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Role Management</h3>
                            <p className="text-sm sm:text-base text-gray-600">
                                Structured roles for Country Leaders and Members with appropriate permissions.
                            </p>
                        </div>

                        <div className="p-6 sm:p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg hover:shadow-xl transition-all">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-600 rounded-xl flex items-center justify-center mb-4">
                                <FaGlobe className="text-xl sm:text-2xl text-white" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Global Reach</h3>
                            <p className="text-sm sm:text-base text-gray-600">
                                Connect with ministry members worldwide and coordinate activities globally.
                            </p>
                        </div>

                        <div className="p-6 sm:p-8 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl shadow-lg hover:shadow-xl transition-all">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-600 rounded-xl flex items-center justify-center mb-4">
                                <FaChurch className="text-xl sm:text-2xl text-white" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Ministry Focus</h3>
                            <p className="text-sm sm:text-base text-gray-600">
                                Purpose-built for ministry operations with features tailored to your needs.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 px-2">
                        Ready to Get Started?
                    </h2>
                    <p className="text-base sm:text-lg lg:text-xl text-indigo-100 mb-6 sm:mb-10 max-w-2xl mx-auto px-4">
                        Join ministry leaders and members around the world using our platform to stay organized and connected.
                    </p>
                    <Link 
                        to="/register" 
                        className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl text-base sm:text-lg font-medium w-auto mx-4 sm:mx-0"
                    >
                        Create Your Account <FaArrowRight />
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-6 sm:py-8">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
                        <FaChurch className="text-xl sm:text-2xl" />
                        <span className="text-lg sm:text-xl font-bold">Ministry Reports</span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-400 px-4">
                        © 2025 Ministry Report System. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Welcome;
