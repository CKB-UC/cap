import React, { useState } from 'react';
import { X } from 'lucide-react';

const WorkshopRegistration = ({ workshopTitle, workshopDate, workshopTime, workshopLocation, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    workshop: workshopTitle
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic form validation
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Phone validation (assuming Philippine phone number format)
    const phoneRegex = /^(09|\+639)\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert('Please enter a valid Philippine phone number (e.g., 09123456789)');
      return;
    }

    // Call onSubmit with form data
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1100]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold mb-4 text-center">
          Register for {workshopTitle}
        </h2>
        
        <div className="bg-gray-100 p-4 rounded-md mb-4">
          <p><strong>Date:</strong> {workshopDate}</p>
          <p><strong>Time:</strong> {workshopTime}</p>
          <p><strong>Location:</strong> {workshopLocation}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-2 font-medium">
              Full Name
            </label>
            <input 
              type="text" 
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block mb-2 font-medium">
              Email Address
            </label>
            <input 
              type="email" 
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block mb-2 font-medium">
              Phone Number
            </label>
            <input 
              type="tel" 
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number (e.g., 09123456789)"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition duration-300"
          >
            Confirm Registration
          </button>
        </form>
      </div>
    </div>
  );
};

export default WorkshopRegistration;