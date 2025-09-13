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
}

const Properties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('price_desc');

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      console.log('Loading all properties from database...');
      
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/get-properties`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('All properties loaded successfully:', data.count, 'properties');
        setProperties(data.properties || []);
      } else {
        console.error('Failed to load properties:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error details:', errorText);
        setProperties([]);
      }
    } catch (error) {
      console.error('Error loading all properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'For Sale': return 'bg-blue-600';
      case 'For Rent': return 'bg-green-600';
      case 'Investment': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const formatPrice = (price: number, isRental: boolean = false) => {
    if (isRental) {
      return `$${price.toLocaleString()}/mo`;
    }
    return `$${price.toLocaleString()}`;
  };

  const handlePropertyClick = (propertyId: number) => {
    navigate(`/property/${propertyId}`);
  };

  const filteredProperties = properties.filter(property => {
    if (filterType !== 'all' && property.type.toLowerCase() !== filterType.toLowerCase()) {
      return false;
    }
    
    if (priceRange !== 'all') {
      const price = property.is_rental ? property.price * 12 : property.price;
      switch (priceRange) {
        case 'under_1m':
          return price < 1000000;
        case '1m_3m':
          return price >= 1000000 && price <= 3000000;
        case 'over_3m':
          return price > 3000000;
        default:
          return true;
      }
    }
    
    return true;
  });

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    const aPrice = a.is_rental ? a.price * 12 : a.price;
    const bPrice = b.is_rental ? b.price * 12 : b.price;
    
    switch (sortBy) {
      case 'price_asc':
        return aPrice - bPrice;
      case 'price_desc':
        return bPrice - aPrice;
      case 'sqft_desc':
        return b.sqft - a.sqft;
      default:
        return bPrice - aPrice;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

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
                <button onClick={() => navigate('/properties')} className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium cursor-pointer">Properties</button>
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

      {/* Header */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">All Properties</h1>
            <p className="text-xl text-gray-600">Find your perfect property from our extensive collection</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-6 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
              >
                <option value="all">All Types</option>
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="duplex">Duplex</option>
                <option value="penthouse">Penthouse</option>
                <option value="estate">Estate</option>
                <option value="townhouse">Townhouse</option>
                <option value="loft">Loft</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <select 
                value={priceRange} 
                onChange={(e) => setPriceRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
              >
                <option value="all">All Prices</option>
                <option value="under_1m">Under $1M</option>
                <option value="1m_3m">$1M - $3M</option>
                <option value="over_3m">Over $3M</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
              >
                <option value="price_desc">Price: High to Low</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="sqft_desc">Square Feet: Large to Small</option>
              </select>
            </div>
            <div className="flex items-end">
              <span className="text-sm text-gray-600">{sortedProperties.length} properties found</span>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading properties...</p>
          </div>
        ) : sortedProperties.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-product-shop>
            {sortedProperties.map((property) => (
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
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-home-4-line text-gray-400 text-3xl w-12 h-12 flex items-center justify-center"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">No Properties Found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {properties.length === 0 
                ? "Properties added through your admin dashboard will appear here." 
                : "No properties match your current filters. Try adjusting your search criteria."
              }
            </p>
            {properties.length === 0 && (
              <button 
                onClick={() => navigate('/admin')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold whitespace-nowrap cursor-pointer"
              >
                Go to Admin Dashboard
              </button>
            )}
          </div>
        )}
      </div>

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

export default Properties;
