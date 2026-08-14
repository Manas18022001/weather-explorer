import React, { useState } from 'react';
import { storeWeatherData, StoreWeatherRequest } from '../lib/api';
import { CloudRain, Loader2, AlertCircle } from 'lucide-react';
import { addDays, format, differenceInDays } from 'date-fns';
import dynamic from 'next/dynamic';

const MapSelector = dynamic(() => import('./MapSelector'), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-gray-50 rounded-xl animate-pulse flex items-center justify-center mb-4 border border-gray-200">
      <span className="text-gray-400 font-medium flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading Map...</span>
    </div>
  ),
});

interface InputPanelProps {
  onSuccess: (fileName: string) => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<StoreWeatherRequest>({
    latitude: 37.7749, // Default to SF
    longitude: -122.4194,
    start_date: format(addDays(new Date(), -14), 'yyyy-MM-dd'),
    end_date: format(addDays(new Date(), -1), 'yyyy-MM-dd'),
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name.includes('tude') ? parseFloat(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (formData.latitude < -90 || formData.latitude > 90) {
      return setError("Latitude must be between -90 and 90");
    }
    if (formData.longitude < -180 || formData.longitude > 180) {
      return setError("Longitude must be between -180 and 180");
    }
    
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    
    if (start > end) {
      return setError("Start date cannot be after end date");
    }
    if (differenceInDays(end, start) > 31) {
      return setError("Date range cannot exceed 31 days");
    }

    setIsLoading(true);
    try {
      const result = await storeWeatherData(formData);
      onSuccess(result.file);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch and store weather data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center space-x-2 mb-6">
        <CloudRain className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-semibold text-gray-800">Fetch New Data</h2>
      </div>

      <MapSelector 
        lat={formData.latitude} 
        lon={formData.longitude} 
        onChange={(lat, lon) => setFormData(prev => ({ ...prev, latitude: lat, longitude: lon }))} 
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
              required
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <span>Fetch & Store</span>
          )}
        </button>
      </form>
    </div>
  );
};
