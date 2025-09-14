import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Property {
  id: number;
  title: string;
  location: string;
  price: number;
  type: string;
  status: string;
  beds: number;
  baths: number;
  sqft: number;
  is_rental?: boolean;
  image_url: string;
  area?: string;
}

const Home = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [consultationData, setConsultationData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    serviceType: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showConsultationForm, setShowConsultationForm] = useState(false);
  const [isConsultationSubmitting, setIsConsultationSubmitting] = useState(false);
  const [consultationSubmitStatus, setConsultationSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [loadingProperties, setLoadingProperties] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoadingProperties(true);
      console.log('Loading featured properties from database...');
      
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/get-properties`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Featured properties loaded successfully:', data.count, 'properties');
        // Show first 3 properties as featured, or empty array if no properties
        const featuredProperties = data.properties?.slice(0, 3) || [];
        setProperties(featuredProperties);
      } else {
        console.error('Failed to load properties:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error details:', errorText);
        setProperties([]);
      }
    } catch (error) {
      console.error('Error loading featured properties:', error);
      setProperties([]);
    } finally {
      setLoadingProperties(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConsultationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConsultationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formDataToSend = new URLSearchParams();
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('message', formData.message);

      const response = await fetch('https://readdy.ai/api/form/submit/contact_form_67633e4e4c94b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formDataToSend
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          message: ''
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConsultationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConsultationSubmitting(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/submit-consultation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(consultationData),
      });

      if (response.ok) {
        setConsultationSubmitStatus('success');
        setConsultationData({
          name: '',
          email: '',
          phone: '',
          preferredDate: '',
          preferredTime: '',
          serviceType: '',
          message: ''
        });
        setTimeout(() => {
          setShowConsultationForm(false);
          setConsultationSubmitStatus('idle');
        }, 3000);
      } else {
        setConsultationSubmitStatus('error');
      }
    } catch (error) {
      setConsultationSubmitStatus('error');
    } finally {
      setIsConsultationSubmitting(false);
    }
  };

  const handlePropertyClick = (propertyId: number) => {
    navigate(`/property/${propertyId}`);
  };

  const formatPrice = (price: number, isRental: boolean = false) => {
    if (isRental) {
      return `$${price.toLocaleString()}/mo`;
    }
    return `$${price.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'For Sale': return 'bg-blue-600';
      case 'For Rent': return 'bg-green-600';
      case 'Investment': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Sarah Mitchell</h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#home" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium cursor-pointer">Home</a>
                <a href="#about" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium cursor-pointer">About</a>
                <button onClick={() => navigate('/properties')} className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium cursor-pointer">Properties</button>
                <a href="#services" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium cursor-pointer">Services</a>
                <a href="#contact" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium cursor-pointer">Contact</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a href="https://wa.me/15551234567" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center cursor-pointer">
                <i className="ri-whatsapp-line text-white w-4 h-4 flex items-center justify-center"></i>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center bg-cover bg-center" style={{
        backgroundImage: 'url(https://readdy.ai/api/search-image?query=modern%20luxury%20home%20exterior%20with%20large%20windows%20and%20landscaped%20garden%2C%20contemporary%20architecture%2C%20beautiful%20residential%20property%2C%20clean%20lines%2C%20natural%20lighting%2C%20left%20side%20darker%20for%20text%20overlay&width=1920&height=1080&seq=hero1&orientation=landscape)'
      }}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-left text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Your Dream Home<br />
              <span className="text-blue-400">Awaits</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl">
              Expert real estate guidance with personalized service. Let me help you find the perfect property or sell your home for the best price.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#contact" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold whitespace-nowrap cursor-pointer inline-block text-center">
                Start Your Journey
              </a>
              <button onClick={() => navigate('/properties')} className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold whitespace-nowrap cursor-pointer inline-block text-center">
                Browse Properties
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-bold text-gray-900 mb-8">Meet Sarah Mitchell</h2>
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                With over 12 years of experience in luxury real estate, I've helped hundreds of families find their perfect homes and investors build successful portfolios. My commitment to excellence and personalized service has made me one of the top-performing agents in the region.
              </p>
              <div className="grid grid-cols-2 gap-8 mb-10">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-3">500+</div>
                  <div className="text-lg text-gray-700">Properties Sold</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-3">$250M+</div>
                  <div className="text-lg text-gray-700">Sales Volume</div>
                </div>
              </div>
              <button 
                onClick={() => setShowConsultationForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-lg text-lg font-semibold whitespace-nowrap cursor-pointer"
              >
                Schedule Consultation
              </button>
            </div>
            <div className="relative">
              <img 
                alt="Sarah Mitchell" 
                className="rounded-lg shadow-lg object-cover w-full h-[500px] object-top" 
                src="https://readdy.ai/api/search-image?query=professional%20real%20estate%20agent%20Sarah%20Mitchell%2C%20confident%20businesswoman%20in%20elegant%20blazer%2C%20warm%20smile%2C%20holding%20house%20keys%2C%20modern%20office%20setting%20with%20property%20listings%20in%20background%2C%20natural%20lighting&width=600&height=700&seq=about1&orientation=portrait"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">My Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive real estate solutions tailored to your unique needs
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-home-4-line text-white text-2xl w-8 h-8 flex items-center justify-center"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Home Buying</h3>
              <p className="text-gray-600">
                Expert guidance through every step of the home buying process, from search to closing.
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-price-tag-3-line text-white text-2xl w-8 h-8 flex items-center justify-center"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Home Selling</h3>
              <p className="text-gray-600">
                Strategic marketing and pricing to sell your property quickly and for the best price.
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-line-chart-line text-white text-2xl w-8 h-8 flex items-center justify-center"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Investment Properties</h3>
              <p className="text-gray-600">
                Identify profitable investment opportunities and build your real estate portfolio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section id="properties" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Properties</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover exceptional properties carefully selected for discerning buyers
            </p>
          </div>
          
          {loadingProperties ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading featured properties...</p>
            </div>
          ) : properties.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-product-shop>
                {properties.map((property) => (
                  <div key={property.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                    <div className="relative">
                      <img 
                        alt={property.title}
                        className="w-full h-64 object-cover object-top" 
                        src={property.image_url}
                      />
                      <div className="absolute top-4 left-4">
                        <span className={`${getStatusColor(property.status)} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                          {property.status}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                          {property.type}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{property.title}</h3>
                      <p className="text-gray-600 mb-4 flex items-center">
                        <i className="ri-map-pin-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                        {property.location}
                        {property.area && <span className="ml-2 text-blue-600 font-medium">• {property.area}</span>}
                      </p>
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatPrice(property.price, property.is_rental)}
                        </div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 mb-4">
                        <span className="flex items-center">
                          <i className="ri-hotel-bed-line mr-1 w-4 h-4 flex items-center justify-center"></i>
                          {property.beds} beds
                        </span>
                        <span className="flex items-center">
                          <i className="ri-drop-line mr-1 w-4 h-4 flex items-center justify-center"></i>
                          {property.baths} baths
                        </span>
                        <span className="flex items-center">
                          <i className="ri-aspect-ratio-line mr-1 w-4 h-4 flex items-center justify-center"></i>
                          {property.sqft.toLocaleString()} sqft
                        </span>
                      </div>
                      <button 
                        onClick={() => handlePropertyClick(property.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold whitespace-nowrap cursor-pointer"
                      >
                        See Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-12">
                <button 
                  onClick={() => navigate('/properties')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold whitespace-nowrap cursor-pointer"
                >
                  View All Properties
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-home-4-line text-gray-400 text-3xl w-12 h-12 flex items-center justify-center"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">No Properties Available</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Properties added through your admin dashboard will appear here as featured listings.
              </p>
              <div className="text-center mt-12">
                <button 
                  onClick={() => navigate('/properties')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold whitespace-nowrap cursor-pointer"
                >
                  Browse All Properties
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Client Testimonials</h2>
            <p className="text-xl text-gray-600">What my clients say about working with me</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="flex items-center mb-4">
                <img 
                  alt="Michael Chen" 
                  className="w-12 h-12 rounded-full object-cover mr-4 object-top" 
                  src="https://readdy.ai/api/search-image?query=professional%20headshot%20of%20confident%20Asian%20businessman%20in%20his%20thirties%2C%20wearing%20dark%20business%20suit%2C%20friendly%20smile%2C%20modern%20office%20background%2C%20corporate%20portrait%20style&width=80&height=80&seq=testimonial1&orientation=squarish"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">Michael Chen</h4>
                  <p className="text-gray-600 text-sm">First-time Buyer</p>
                </div>
              </div>
              <div className="flex mb-4">
                <i className="ri-star-fill text-yellow-400 w-4 h-4 flex items-center justify-center"></i>
                <i className="ri-star-fill text-yellow-400 w-4 h-4 flex items-center justify-center"></i>
                <i className="ri-star-fill text-yellow-400 w-4 h-4 flex items-center justify-center"></i>
                <i className="ri-star-fill text-yellow-400 w-4 h-4 flex items-center justify-center"></i>
                <i className="ri-star-fill text-yellow-400 w-4 h-4 flex items-center justify-center"></i>
              </div>
              <p className="text-gray-700 italic">
                "Sarah made my first home purchase seamless. Her expertise and patience throughout the process were invaluable. I couldn't have asked for a better agent!"
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="flex items-center mb-4">
                <img 
                  alt="Emma Rodriguez" 
                  className="w-12 h-12 rounded-full object-cover mr-4 object-top" 
                  src="https://readdy.ai/api/search-image?query=professional%20headshot%20of%20confident%20Latina%20businesswoman%20in%20her%20forties%2C%20wearing%20blazer%2C%20warm%20smile%2C%20modern%20office%20setting%2C%20corporate%20portrait%20photography&width=80&height=80&seq=testimonial2&orientation=squarish"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">Emma Rodriguez</h4>
                  <p className="text-gray-600 text-sm">Property Investor</p>
                </div>
              </div>
              <div className="flex mb-4">
                <i className="ri-star-fill text-yellow-400 w-4 h-4 flex items-center justify-center"></i>
                <i className="ri-star-fill text-yellow-400 w-4 h-4 flex items-center justify-center"></i>
                <i className="ri-star-fill text-yellow-400 w-4 h-4 flex items-center justify-center"></i>
                <i className="ri-star-fill text-yellow-400 w-4 h-4 flex items-center justify-center"></i>
                <i className="ri-star-fill text-yellow-400 w-4 h-4 flex items-center justify-center"></i>
              </div>
              <p className="text-gray-700 italic">
                "Working with Sarah has been a game-changer for my investment portfolio. She has an incredible eye for profitable properties and market trends."
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="flex items-center mb-4">
                <img 
                  alt="David Thompson" 
                  className="w-12 h-12 rounded-full object-cover mr-4 object-top" 
                  src="https://readdy.ai/api/search-image?query=professional%20headshot%20of%20distinguished%20Caucasian%20businessman%20in%20his%20fifties%2C%20wearing%20navy%20suit%2C%20confident%20expression%2C%20upscale%20office%20background%2C%20executive%20portrait%20style&width=80&height=80&seq=testimonial3&orientation=squarish"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">David Thompson</h4>
                  <p className="text-gray-600 text-sm">Luxury Home Seller</p>
                </div>
              </div>
              <div className="flex mb-4">
                <i className="ri-star-fill text-yellow-400 w-4 h-4 flex items-center justify-center"></i>
                <i className="ri-star-fill text-yellow-400 w-4 h-4 flex items-center justify-center"></i>
                <i className="ri-star-fill text-yellow-400 w-4 h-4 flex items-center justify-center"></i>
                <i className="ri-star-fill text-yellow-400 w-4 h-4 flex items-center justify-center"></i>
                <i className="ri-star-fill text-yellow-400 w-4 h-4 flex items-center justify-center"></i>
              </div>
              <p className="text-gray-700 italic">
                "Sarah sold our family home for 15% above asking price in just two weeks. Her marketing strategy and negotiation skills are outstanding."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get In Touch</h2>
            <p className="text-xl text-gray-600">Ready to start your real estate journey? Let's connect!</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                    <i className="ri-phone-line text-white w-5 h-5 flex items-center justify-center"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Phone</p>
                    <p className="text-gray-600">(555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                    <i className="ri-mail-line text-white w-5 h-5 flex items-center justify-center"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Email</p>
                    <p className="text-gray-600">sarah@mitchellrealty.com</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                    <i className="ri-map-pin-line text-white w-5 h-5 flex items-center justify-center"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Office</p>
                    <p className="text-gray-600">123 Main Street, Suite 456<br />Downtown, CA 90210</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <button className="w-10 h-10 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center mr-4 cursor-pointer">
                    <i className="ri-whatsapp-line text-white w-4 h-4 flex items-center justify-center"></i>
                  </button>
                  <div>
                    <p className="font-semibold text-gray-900">WhatsApp</p>
                    <p className="text-gray-600">Quick response guaranteed</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Send me a message</h3>
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  Thank you for your message! I'll get back to you soon.
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  Sorry, there was an error sending your message. Please try again.
                </div>
              )}
              <form className="space-y-6" onSubmit={handleSubmit} id="contact_form" data-readdy-form>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input 
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" 
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input 
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" 
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" 
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input 
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" 
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea 
                    rows={4}
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" 
                    placeholder="Tell me about your real estate needs..."
                    maxLength={500}
                    required
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <h3 className="text-2xl font-bold mb-4">Sarah Mitchell</h3>
              <p className="text-gray-400 mb-6">
                Your trusted real estate professional dedicated to helping you achieve your property goals with personalized service and expert market knowledge.
              </p>
              <div className="flex space-x-4">
                <a href="https://wa.me/15551234567" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center cursor-pointer">
                  <i className="ri-whatsapp-line w-5 h-5 flex items-center justify-center"></i>
                </a>
                <div className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center cursor-pointer">
                  <i className="ri-linkedin-fill w-5 h-5 flex items-center justify-center"></i>
                </div>
                <div className="w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center cursor-pointer">
                  <i className="ri-facebook-fill w-5 h-5 flex items-center justify-center"></i>
                </div>
                <div className="w-10 h-10 bg-pink-500 hover:bg-pink-600 rounded-full flex items-center justify-center cursor-pointer">
                  <i className="ri-instagram-fill w-5 h-5 flex items-center justify-center"></i>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#home" className="text-gray-400 hover:text-white cursor-pointer">Home</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-white cursor-pointer">About</a></li>
                <li><a href="#services" className="text-gray-400 hover:text-white cursor-pointer">Services</a></li>
                <li><button onClick={() => navigate('/properties')} className="text-gray-400 hover:text-white cursor-pointer">Properties</button></li>
                <li><a href="#contact" className="text-gray-400 hover:text-white cursor-pointer">Contact</a></li>
                <li><a href="https://readdy.ai/?origin=logo" className="text-gray-400 hover:text-white cursor-pointer">Made with Readdy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2">
                <li><span className="text-gray-400">Home Buying</span></li>
                <li><span className="text-gray-400">Home Selling</span></li>
                <li><span className="text-gray-400">Investment Properties</span></li>
                <li><span className="text-gray-400">Market Analysis</span></li>
                <li><span className="text-gray-400">Property Management</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 Sarah Mitchell Real Estate. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Consultation Form Modal */}
      {showConsultationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Schedule Consultation</h3>
              <button 
                onClick={() => setShowConsultationForm(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line w-6 h-6 flex items-center justify-center"></i>
              </button>
            </div>
            
            {consultationSubmitStatus === 'success' && (
              <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                Thank you! Your consultation has been scheduled. I'll contact you soon to confirm.
              </div>
            )}
            {consultationSubmitStatus === 'error' && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                Sorry, there was an error scheduling your consultation. Please try again.
              </div>
            )}

            <form onSubmit={handleConsultationSubmit} id="consultation_form" data-readdy-form>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text"
                    name="name"
                    value={consultationData.name}
                    onChange={handleConsultationChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" 
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email"
                    name="email"
                    value={consultationData.email}
                    onChange={handleConsultationChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" 
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input 
                    type="tel"
                    name="phone"
                    value={consultationData.phone}
                    onChange={handleConsultationChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" 
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                  <input 
                    type="date"
                    name="preferredDate"
                    value={consultationData.preferredDate}
                    onChange={handleConsultationChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                  <select 
                    name="preferredTime"
                    value={consultationData.preferredTime}
                    onChange={handleConsultationChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm pr-8"
                    required
                  >
                    <option value="">Select time</option>
                    <option value="9:00 AM">9:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="1:00 PM">1:00 PM</option>
                    <option value="2:00 PM">2:00 PM</option>
                    <option value="3:00 PM">3:00 PM</option>
                    <option value="4:00 PM">4:00 PM</option>
                    <option value="5:00 PM">5:00 PM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Interest</label>
                  <select 
                    name="serviceType"
                    value={consultationData.serviceType}
                    onChange={handleConsultationChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm pr-8"
                    required
                  >
                    <option value="">Select service</option>
                    <option value="Home Buying">Home Buying</option>
                    <option value="Home Selling">Home Selling</option>
                    <option value="Investment Properties">Investment Properties</option>
                    <option value="Property Evaluation">Property Evaluation</option>
                    <option value="Market Analysis">Market Analysis</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details</label>
                  <textarea 
                    rows={3}
                    name="message"
                    value={consultationData.message}
                    onChange={handleConsultationChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" 
                    placeholder="Tell me about your real estate goals..."
                    maxLength={500}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isConsultationSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConsultationSubmitting ? 'Scheduling...' : 'Schedule Consultation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
