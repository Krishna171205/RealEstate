
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface Property {
  id: number;
  title: string;
  location: string;
  full_address: string;
  price: number;
  type: string;
  status: string;
  beds: number;
  baths: number;
  sqft: number;
  garage: number;
  description: string;
  is_rental?: boolean;
  image_url: string;
}

const PropertyDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Generate multiple image views for property
  const generatePropertyImages = (property: Property) => {
    const baseQuery = `${property.type.toLowerCase()} property`;
    return [
      property.image_url,
      `https://readdy.ai/api/search-image?query=$%7BbaseQuery%7D%20interior%20living%20room%2C%20modern%20design%2C%20spacious%20layout%2C%20natural%20lighting&width=800&height=500&seq=detail${property.id}a&orientation=landscape`,
      `https://readdy.ai/api/search-image?query=$%7BbaseQuery%7D%20kitchen%20interior%2C%20modern%20appliances%2C%20elegant%20design%2C%20functional%20layout&width=800&height=500&seq=detail${property.id}b&orientation=landscape`,
      `https://readdy.ai/api/search-image?query=$%7BbaseQuery%7D%20bedroom%20interior%2C%20comfortable%20space%2C%20modern%20design%2C%20natural%20lighting&width=800&height=500&seq=detail${property.id}c&orientation=landscape`
    ];
  };

  useEffect(() => {
    loadProperty();
  }, [id]);

  const loadProperty = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/get-properties`);
      
      if (response.ok) {
        const data = await response.json();
        const foundProperty = data.properties.find((p: Property) => p.id.toString() === id);
        
        if (foundProperty) {
          setProperty(foundProperty);
        } else {
          navigate('/properties');
        }
      }
    } catch (error) {
      console.error('Error loading property:', error);
      navigate('/properties');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formDataToSend = new URLSearchParams();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('message', formData.message);
      formDataToSend.append('property', property?.title || '');

      const response = await fetch('https://readdy.ai/api/form/d30trnuld3g0jopqalf0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formDataToSend
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: ''
        });
        setTimeout(() => {
          setShowContactForm(false);
          setSubmitStatus('idle');
        }, 3000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h2>
          <button 
            onClick={() => navigate('/properties')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  const propertyImages = generatePropertyImages(property);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button onClick={() => navigate('/')} className="text-2xl font-bold text-gray-900 cursor-pointer">
                Sarah Mitchell
              </button>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <button onClick={() => navigate('/')} className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium cursor-pointer">Home</button>
                <a href="/#about" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium cursor-pointer">About</a>
                <button onClick={() => navigate('/properties')} className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium cursor-pointer">Properties</button>
                <a href="/#services" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium cursor-pointer">Services</a>
                <a href="/#contact" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium cursor-pointer">Contact</a>
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

      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button onClick={() => navigate('/')} className="hover:text-blue-600 cursor-pointer">Home</button>
            <i className="ri-arrow-right-s-line w-4 h-4 flex items-center justify-center"></i>
            <button onClick={() => navigate('/properties')} className="hover:text-blue-600 cursor-pointer">Properties</button>
            <i className="ri-arrow-right-s-line w-4 h-4 flex items-center justify-center"></i>
            <span className="text-gray-900">{property.title}</span>
          </div>
        </div>
      </div>

      {/* Property Images */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="relative">
            <img 
              alt={property.title}
              className="w-full h-96 object-cover rounded-lg object-top" 
              src={propertyImages[currentImageIndex]}
            />
            <div className="absolute top-4 left-4">
              <span className={`${getStatusColor(property.status)} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                {property.status}
              </span>
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {propertyImages.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full cursor-pointer ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {propertyImages.slice(1, 4).map((image: string, index: number) => (
              <img 
                key={index}
                alt={`${property.title} view ${index + 2}`}
                className="w-full h-44 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity object-top" 
                src={image}
                onClick={() => setCurrentImageIndex(index + 1)}
              />
            ))}
            {propertyImages.length > 4 && (
              <div className="w-full h-44 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors">
                <span className="text-gray-600 font-medium">+{propertyImages.length - 4} more</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{property.title}</h1>
              <p className="text-xl text-gray-600 mb-4 flex items-center">
                <i className="ri-map-pin-line mr-2 w-5 h-5 flex items-center justify-center"></i>
                {property.full_address}
              </p>
              <div className="text-3xl font-bold text-blue-600 mb-6">
                {formatPrice(property.price, property.is_rental)}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <i className="ri-hotel-bed-line text-2xl text-blue-600 mb-2 w-8 h-8 flex items-center justify-center mx-auto"></i>
                  <div className="font-semibold text-gray-900">{property.beds}</div>
                  <div className="text-sm text-gray-600">Bedrooms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <i className="ri-drop-line text-2xl text-blue-600 mb-2 w-8 h-8 flex items-center justify-center mx-auto"></i>
                  <div className="font-semibold text-gray-900">{property.baths}</div>
                  <div className="text-sm text-gray-600">Bathrooms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <i className="ri-aspect-ratio-line text-2xl text-blue-600 mb-2 w-8 h-8 flex items-center justify-center mx-auto"></i>
                  <div className="font-semibold text-gray-900">{property.sqft.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Sq Ft</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <i className="ri-car-line text-2xl text-blue-600 mb-2 w-8 h-8 flex items-center justify-center mx-auto"></i>
                  <div className="font-semibold text-gray-900">{property.garage}</div>
                  <div className="text-sm text-gray-600">Garage</div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>
          </div>

          {/* Contact Form Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg sticky top-8">
              <div className="text-center mb-6">
                <img 
                  alt="Sarah Mitchell" 
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover object-top" 
                  src="https://readdy.ai/api/search-image?query=professional%20real%20estate%20agent%20Sarah%20Mitchell%2C%20confident%20businesswoman%20in%20elegant%20blazer%2C%20warm%20smile%2C%20holding%20house%20keys%2C%20modern%20office%20setting%20with%20property%20listings%20in%20background%2C%20natural%20lighting&width=80&height=80&seq=agent1&orientation=squarish"
                />
                <h3 className="text-xl font-semibold text-gray-900">Sarah Mitchell</h3>
                <p className="text-gray-600">Licensed Real Estate Agent</p>
                <div className="flex justify-center space-x-2 mt-2">
                  <i className="ri-star-fill text-yellow-400 w-4 h-4 flex items-center justify-center"></i>
                  <i className="ri-star-fill text-yellow-400 w-4 h-4 flex items-center justify-center"></i>
                  <i className="ri-star-fill text-yellow-400 w-4 h-4 flex items-center justify-center"></i>
                  <i className="ri-star-fill text-yellow-400 w-4 h-4 flex items-center justify-center"></i>
                  <i className="ri-star-fill text-yellow-400 w-4 h-4 flex items-center justify-center"></i>
                  <span className="text-sm text-gray-600 ml-2">5.0 (245 reviews)</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <a href="tel:+15551234567" className="text-blue-600 hover:text-blue-700 cursor-pointer">(555) 123-4567</a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Email:</span>
                  <a href="mailto:sarah@mitchellrealty.com" className="text-blue-600 hover:text-blue-700 cursor-pointer text-sm">sarah@mitchellrealty.com</a>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => setShowContactForm(!showContactForm)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold whitespace-nowrap cursor-pointer"
                >
                  Contact About This Property
                </button>
                <a 
                  href={`https://wa.me/15551234567?text=Hi Sarah, I'm interested in the property: ${property.title}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold whitespace-nowrap cursor-pointer flex items-center justify-center"
                >
                  <i className="ri-whatsapp-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                  WhatsApp Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Contact About This Property</h3>
              <button 
                onClick={() => setShowContactForm(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line w-6 h-6 flex items-center justify-center"></i>
              </button>
            </div>
            
            {submitStatus === 'success' && (
              <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                Thank you for your inquiry! I'll get back to you soon.
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                Sorry, there was an error sending your message. Please try again.
              </div>
            )}

            <form onSubmit={handleSubmit} id="property_inquiry_form" data-readdy-form>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input 
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" 
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
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
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" 
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea 
                    rows={3}
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" 
                    placeholder="I'm interested in this property..."
                    maxLength={500}
                    required
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-7   00 text-white py-2 rounded-lg font-semibold whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                <li><button onClick={() => navigate('/')} className="text-gray-400 hover:text-white cursor-pointer">Home</button></li>
                <li><a href="/#about" className="text-gray-400 hover:text-white cursor-pointer">About</a></li>
                <li><a href="/#services" className="text-gray-400 hover:text-white cursor-pointer">Services</a></li>
                <li><button onClick={() => navigate('/properties')} className="text-gray-400 hover:text-white cursor-pointer">Properties</button></li>
                <li><a href="/#contact" className="text-gray-400 hover:text-white cursor-pointer">Contact</a></li>
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
    </div>
  );
};

export default PropertyDetail;
