
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
);

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
  area?: string;
  created_at: string;
}

interface Consultation {
  id: number;
  name: string;
  email: string;
  phone: string;
  preferred_date: string;
  preferred_time: string;
  service_type: string;
  message: string;
  status: 'pending' | 'confirmed' | 'completed';
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [_user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('properties');
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [showEditProperty, setShowEditProperty] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [properties, setProperties] = useState<Property[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);

  const [newProperty, setNewProperty] = useState<Partial<Property>>({
    title: '',
    location: '',
    full_address: '',
    price: 0,
    type: 'House',
    status: 'For Sale',
    beds: 1,
    baths: 1,
    sqft: 1000,
    garage: 1,
    description: '',
    is_rental: false,
    area: ''
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Redirect to login page if not authenticated
        navigate('/admin/login');
        return;
      }
      
      setUser(user);
      loadData();
    } catch (error) {
      console.error('Auth error:', error);
      navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    await Promise.all([loadProperties(), loadConsultations()]);
  };

  const loadProperties = async () => {
    try {
      console.log('Loading properties from database...')
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/manage-properties`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Properties loaded:', data);
        setProperties(data.properties || []);
      } else {
        console.error('Failed to load properties:', response.status, response.statusText);
        const errorData = await response.text();
        console.error('Error details:', errorData);
        setProperties([]);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
      setProperties([]);
    }
  };

  const loadConsultations = async () => {
    try {
      console.log('Loading consultations from database...')
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/manage-consultations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Consultations loaded:', data);
        setConsultations(data.consultations || []);
      } else {
        console.error('Failed to load consultations:', response.status, response.statusText);
        setConsultations([]);
      }
    } catch (error) {
      console.error('Error loading consultations:', error);
      setConsultations([]);
    }
  };

  const handleAddProperty = async () => {
    if (!newProperty.title || !newProperty.location || !newProperty.description) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Adding new property:', newProperty);
      
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/manage-properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newProperty.title,
          location: newProperty.location,
          fullAddress: newProperty.full_address || newProperty.location,
          price: Number(newProperty.price) || 0,
          type: newProperty.type || 'House',
          status: newProperty.status || 'For Sale',
          beds: Number(newProperty.beds) || 1,
          baths: Number(newProperty.baths) || 1,
          sqft: Number(newProperty.sqft) || 1000,
          garage: Number(newProperty.garage) || 1,
          description: newProperty.description,
          isRental: Boolean(newProperty.is_rental),
          area: newProperty.area || ''
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Property added successfully:', result);
        
        // Reload properties to get fresh data
        await loadProperties();
        
        // Reset form
        setNewProperty({
          title: '',
          location: '',
          full_address: '',
          price: 0,
          type: 'House',
          status: 'For Sale',
          beds: 1,
          baths: 1,
          sqft: 1000,
          garage: 1,
          description: '',
          is_rental: false,
          area: ''
        });
        setShowAddProperty(false);
        alert('Property added successfully!');
      } else {
        const errorData = await response.json();
        console.error('Error adding property:', errorData);
        alert(`Error adding property: ${errorData.error || 'Please try again'}`);
      }
    } catch (error) {
      console.error('Error adding property:', error);
      alert('Error adding property. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProperty = async () => {
    if (!selectedProperty) return;

    setIsSubmitting(true);
    try {
      console.log('Updating property:', selectedProperty);
      
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/manage-properties`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedProperty.id,
          title: selectedProperty.title,
          location: selectedProperty.location,
          fullAddress: selectedProperty.full_address,
          price: Number(selectedProperty.price) || 0,
          type: selectedProperty.type,
          status: selectedProperty.status,
          beds: Number(selectedProperty.beds) || 1,
          baths: Number(selectedProperty.baths) || 1,
          sqft: Number(selectedProperty.sqft) || 1000,
          garage: Number(selectedProperty.garage) || 1,
          description: selectedProperty.description,
          isRental: Boolean(selectedProperty.is_rental),
          area: selectedProperty.area || ''
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Property updated successfully:', result);
        
        // Reload properties to get fresh data
        await loadProperties();
        
        setShowEditProperty(false);
        setSelectedProperty(null);
        alert('Property updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('Error updating property:', errorData);
        alert(`Error updating property: ${errorData.error || 'Please try again'}`);
      }
    } catch (error) {
      console.error('Error updating property:', error);
      alert('Error updating property. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProperty = async (id: number) => {
    const property = properties.find(p => p.id === id);
    
    if (!window.confirm(`Are you sure you want to delete "${property?.title || 'this property'}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Deleting property with ID:', id);
      
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/manage-properties`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ id: Number(id) }),
      });

      if (response.ok) {
        console.log('Property deleted successfully');
        
        // Immediately update local state
        setProperties(prevProperties => prevProperties.filter(p => p.id !== id));
        
        // Show success feedback
        alert('Property deleted successfully!');
        
      } else {
        // Handle HTTP errors
        let errorMessage = 'Unknown error occurred';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        console.error('Error deleting property:', errorMessage);
        alert(`Error deleting property: ${errorMessage}`);
      }
    } catch (error) {
      // Handle network and other errors
      console.error('Network error while deleting property:', error);
      
      let errorMessage = 'Network connection failed. Please check your internet connection and try again.';
      if (error instanceof Error) {
        errorMessage = error.message.includes('fetch') 
          ? 'Network connection failed. Please check your internet connection and try again.'
          : `Error: ${error.message}`;
      }
      
      alert(`Error deleting property: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConsultation = async (id: number) => {
    const consultation = consultations.find(c => c.id === id);
    
    if (!window.confirm(`Are you sure you want to delete the consultation from "${consultation?.name || 'this client'}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Deleting consultation with ID:', id);
      
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/manage-consultations`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ id: Number(id) }),
      });

      if (response.ok) {
        console.log('Consultation deleted successfully');
        
        // Immediately update local state
        setConsultations(prevConsultations => prevConsultations.filter(c => c.id !== id));
        
        // Show success feedback
        alert('Consultation deleted successfully!');
        
      } else {
        // Handle HTTP errors
        let errorMessage = 'Unknown error occurred';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        console.error('Error deleting consultation:', errorMessage);
        alert(`Error deleting consultation: ${errorMessage}`);
      }
    } catch (error) {
      // Handle network and other errors
      console.error('Network error while deleting consultation:', error);
      
      let errorMessage = 'Network connection failed. Please check your internet connection and try again.';
      if (error instanceof Error) {
        errorMessage = error.message.includes('fetch') 
          ? 'Network connection failed. Please check your internet connection and try again.'
          : `Error: ${error.message}`;
      }
      
      alert(`Error deleting consultation: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateConsultationStatus = async (id: number, status: 'pending' | 'confirmed' | 'completed') => {
    try {
      console.log('Updating consultation status:', id, status);
      
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/manage-consultations`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });

      if (response.ok) {
        console.log('Consultation status updated successfully');
        await loadConsultations();
      } else {
        const errorData = await response.json();
        console.error('Error updating consultation:', errorData);
        alert(`Error updating consultation: ${errorData.error || 'Please try again'}`);
      }
    } catch (error) {
      console.error('Error updating consultation:', error);
      alert('Error updating consultation. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
    navigate('/admin/login');
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

  const getConsultationStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <div className="text-sm text-gray-500">Sarah Mitchell Real Estate</div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/')}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium cursor-pointer"
              >
                View Website
              </button>
              <button
                onClick={handleSignOut}
                className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium cursor-pointer"
              >
                Sign Out
              </button>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <i className="ri-user-line text-white w-4 h-4 flex items-center justify-center"></i>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-6 py-2 rounded-md font-medium cursor-pointer whitespace-nowrap ${
              activeTab === 'properties'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Properties ({properties.length})
          </button>
          <button
            onClick={() => setActiveTab('consultations')}
            className={`px-6 py-2 rounded-md font-medium cursor-pointer whitespace-nowrap ${
              activeTab === 'consultations'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Consultations ({consultations.filter(c => c.status === 'pending').length})
          </button>
        </div>

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Property Listings</h2>
              <button
                onClick={() => setShowAddProperty(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium whitespace-nowrap cursor-pointer flex items-center"
              >
                <i className="ri-add-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                Add Property
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {properties.map((property) => (
                      <tr key={property.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img 
                              alt={property.title}
                              className="h-12 w-16 rounded object-cover object-top" 
                              src={property.image_url}
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{property.title}</div>
                              <div className="text-sm text-gray-500">{property.type}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {property.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {property.area || 'Not specified'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatPrice(property.price, property.is_rental)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${getStatusColor(property.status)}`}>
                            {property.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {property.beds} beds • {property.baths} baths • {property.sqft.toLocaleString()} sqft
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedProperty(property);
                                setShowEditProperty(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 cursor-pointer"
                            >
                              <i className="ri-edit-line w-4 h-4 flex items-center justify-center"></i>
                            </button>
                            <button
                              onClick={() => navigate(`/property/${property.id}`)}
                              className="text-green-600 hover:text-green-900 cursor-pointer"
                            >
                              <i className="ri-external-link-line w-4 h-4 flex items-center justify-center"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteProperty(property.id)}
                              className="text-red-600 hover:text-red-900 cursor-pointer"
                            >
                              <i className="ri-delete-bin-line w-4 h-4 flex items-center justify-center"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Consultations Tab */}
        {activeTab === 'consultations' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Consultation Requests</h2>
              <div className="flex space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                  <span>Pending ({consultations.filter(c => c.status === 'pending').length})</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                  <span>Confirmed ({consultations.filter(c => c.status === 'confirmed').length})</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preferred Date/Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {consultations.map((consultation) => (
                      <tr key={consultation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{consultation.name}</div>
                            <div className="text-sm text-gray-500">{consultation.email}</div>
                            <div className="text-sm text-gray-500">{consultation.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {consultation.service_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{consultation.preferred_date}</div>
                          <div className="text-gray-500">{consultation.preferred_time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConsultationStatusColor(consultation.status)}`}>
                            {consultation.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {consultation.message}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {consultation.status === 'pending' && (
                              <button
                                onClick={() => updateConsultationStatus(consultation.id, 'confirmed')}
                                className="text-green-600 hover:text-green-900 cursor-pointer"
                                title="Confirm"
                              >
                                <i className="ri-check-line w-4 h-4 flex items-center justify-center"></i>
                              </button>
                            )}
                            {consultation.status === 'confirmed' && (
                              <button
                                onClick={() => updateConsultationStatus(consultation.id, 'completed')}
                                className="text-blue-600 hover:text-blue-900 cursor-pointer"
                                title="Mark Complete"
                              >
                                <i className="ri-check-double-line w-4 h-4 flex items-center justify-center"></i>
                              </button>
                            )}
                            <a
                              href={`mailto:${consultation.email}`}
                              className="text-blue-600 hover:text-blue-900 cursor-pointer"
                              title="Send Email"
                            >
                              <i className="ri-mail-line w-4 h-4 flex items-center justify-center"></i>
                            </a>
                            <a
                              href={`tel:${consultation.phone}`}
                              className="text-green-600 hover:text-green-900 cursor-pointer"
                              title="Call"
                            >
                              <i className="ri-phone-line w-4 h-4 flex items-center justify-center"></i>
                            </a>
                            <button
                              onClick={() => handleDeleteConsultation(consultation.id)}
                              className="text-red-600 hover:text-red-900 cursor-pointer"
                              title="Delete"
                            >
                              <i className="ri-delete-bin-line w-4 h-4 flex items-center justify-center"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Property Modal */}
      {showAddProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Add New Property</h3>
              <button 
                onClick={() => setShowAddProperty(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line w-6 h-6 flex items-center justify-center"></i>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Title</label>
                <input 
                  type="text"
                  value={newProperty.title}
                  onChange={(e) => setNewProperty({...newProperty, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" 
                  placeholder="Modern Family Home in Beverly Hills"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input 
                  type="text"
                  value={newProperty.location}
                  onChange={(e) => setNewProperty({...newProperty, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" 
                  placeholder="Beverly Hills, CA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                <input 
                  type="text"
                  value={newProperty.full_address}
                  onChange={(e) => setNewProperty({...newProperty, full_address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" 
                  placeholder="456 Elm Street, Beverly Hills, CA 90210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input 
                  type="number"
                  value={newProperty.price}
                  onChange={(e) => setNewProperty({...newProperty, price: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" 
                  placeholder="2850000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select 
                  value={newProperty.type}
                  onChange={(e) => setNewProperty({...newProperty, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm pr-8"
                >
                  <option value="House">House</option>
                  <option value="Condo">Condo</option>
                  <option value="Duplex">Duplex</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Estate">Estate</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Loft">Loft</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={newProperty.status}
                  onChange={(e) => setNewProperty({...newProperty, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm pr-8"
                >
                  <option value="For Sale">For Sale</option>
                  <option value="For Rent">For Rent</option>
                  <option value="Investment">Investment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <input 
                  type="number"
                  value={newProperty.beds}
                  onChange={(e) => setNewProperty({...newProperty, beds: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" 
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                <input 
                  type="number"
                  value={newProperty.baths}
                  onChange={(e) => setNewProperty({...newProperty, baths: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-5

                text-sm" 
                min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Square Feet</label>
                <input 
                  type="number"
                  value={newProperty.sqft}
                  onChange={(e) => setNewProperty({...newProperty, sqft: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" 
                  min="500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Garage Spaces</label>
                <input 
                  type="number"
                  value={newProperty.garage}
                  onChange={(e) => setNewProperty({...newProperty, garage: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" 
                  min="0"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  rows={4}
                  value={newProperty.description}
                  onChange={(e) => setNewProperty({...newProperty, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" 
                  placeholder="Describe the property features and highlights..."
                />
              </div>
              <div className="col-span-2">
                <label className="flex items-center">
                  <input 
                    type="checkbox"
                    checked={newProperty.is_rental}
                    onChange={(e) => setNewProperty({...newProperty, is_rental: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">This is a rental property (price per month)</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area/District</label>
                <input 
                  type="text"
                  value={newProperty.area}
                  onChange={(e) => setNewProperty({...newProperty, area: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" 
                  placeholder="Enter area (e.g., Downtown, Beverly Hills, etc.)"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button 
                onClick={() => setShowAddProperty(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddProperty}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer whitespace-nowrap"
              >
                Add Property
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Property Modal */}
      {showEditProperty && selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Edit Property</h3>
              <button 
                onClick={() => setShowEditProperty(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line w-6 h-6 flex items-center justify-center"></i>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Title</label>
                <input 
                  type="text"
                  value={selectedProperty.title}
                  onChange={(e) => setSelectedProperty({...selectedProperty, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input 
                  type="text"
                  value={selectedProperty.location}
                  onChange={(e) => setSelectedProperty({...selectedProperty, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                <input 
                  type="text"
                  value={selectedProperty.full_address}
                  onChange={(e) => setSelectedProperty({...selectedProperty, full_address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input 
                  type="number"
                  value={selectedProperty.price}
                  onChange={(e) => setSelectedProperty({...selectedProperty, price: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select 
                  value={selectedProperty.type}
                  onChange={(e) => setSelectedProperty({...selectedProperty, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm pr-8"
                >
                  <option value="House">House</option>
                  <option value="Condo">Condo</option>
                  <option value="Duplex">Duplex</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Estate">Estate</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Loft">Loft</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={selectedProperty.status}
                  onChange={(e) => setSelectedProperty({...selectedProperty, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm pr-8"
                >
                  <option value="For Sale">For Sale</option>
                  <option value="For Rent">For Rent</option>
                  <option value="Investment">Investment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <input 
                  type="number"
                  value={selectedProperty.beds}
                  onChange={(e) => setSelectedProperty({...selectedProperty, beds: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" 
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                <input 
                  type="number"
                  value={selectedProperty.baths}
                  onChange={(e) => setSelectedProperty({...selectedProperty, baths: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" 
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Square Feet</label>
                <input 
                  type="number"
                  value={selectedProperty.sqft}
                  onChange={(e) => setSelectedProperty({...selectedProperty, sqft: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" 
                  min="500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Garage Spaces</label>
                <input 
                  type="number"
                  value={selectedProperty.garage}
                  onChange={(e) => setSelectedProperty({...selectedProperty, garage: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" 
                  min="0"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  rows={4}
                  value={selectedProperty.description}
                  onChange={(e) => setSelectedProperty({...selectedProperty, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" 
                />
              </div>
              <div className="col-span-2">
                <label className="flex items-center">
                  <input 
                    type="checkbox"
                    checked={selectedProperty.is_rental}
                    onChange={(e) => setSelectedProperty({...selectedProperty, is_rental: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">This is a rental property (price per month)</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area/District</label>
                <input 
                  type="text"
                  value={selectedProperty.area || ''}
                  onChange={(e) => setSelectedProperty({...selectedProperty, area: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" 
                  placeholder="Enter area (e.g., Downtown, Beverly Hills, etc.)"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button 
                onClick={() => setShowEditProperty(false)}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button 
                onClick={handleEditProperty}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
