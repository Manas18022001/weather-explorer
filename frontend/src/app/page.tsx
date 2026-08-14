'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { InputPanel } from '@/components/InputPanel';
import { WeatherChart } from '@/components/WeatherChart';
import { WeatherTable } from '@/components/WeatherTable';
import { listWeatherFiles, getWeatherFileContent, WeatherFile } from '@/lib/api';
import { Cloud, MapPin, Calendar, LayoutDashboard, Menu } from 'lucide-react';

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [files, setFiles] = useState<WeatherFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  
  const [weatherData, setWeatherData] = useState<any | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const data = await listWeatherFiles();
      setFiles(data);
    } catch (err) {
      console.error("Failed to load files", err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleSelectFile = async (fileName: string) => {
    setIsSidebarOpen(false);
    setSelectedFileName(fileName);
    setIsLoadingContent(true);
    setError(null);
    setWeatherData(null);
    
    try {
      const content = await getWeatherFileContent(fileName);
      setWeatherData(content);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load file content");
    } finally {
      setIsLoadingContent(false);
    }
  };

  const handleFetchSuccess = (newFileName: string) => {
    fetchFiles();
    handleSelectFile(newFileName);
  };

  // Transform raw open-meteo json to chart/table format
  const getFormattedData = () => {
    if (!weatherData || !weatherData.daily) return [];
    
    const d = weatherData.daily;
    return d.time.map((timeStr: string, idx: number) => ({
      date: timeStr,
      maxTemp: d.temperature_2m_max[idx],
      minTemp: d.temperature_2m_min[idx],
      appMaxTemp: d.apparent_temperature_max[idx],
      appMinTemp: d.apparent_temperature_min[idx],
    }));
  };

  const formattedData = getFormattedData();

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#f8fafc] text-slate-800 font-sans overflow-hidden">
      <Sidebar 
        files={files} 
        onSelectFile={handleSelectFile} 
        selectedFile={selectedFileName}
        isLoading={isLoadingFiles}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <header className="flex items-center justify-between pb-6 border-b border-gray-200">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center">
                <LayoutDashboard className="w-8 h-8 mr-3 text-blue-600 hidden md:block" />
                Weather Explorer
              </h1>
              <p className="text-gray-500 mt-1 hidden md:block">Ingest, store, and visualize historical climate data.</p>
            </div>
            <button 
              className="md:hidden flex items-center px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg shadow-sm text-gray-700 font-medium transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5 mr-2" /> View Files
            </button>
          </header>

          <InputPanel onSuccess={handleFetchSuccess} />

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
              {error}
            </div>
          )}

          {isLoadingContent ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500">Loading weather data...</p>
            </div>
          ) : weatherData ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-3 md:space-y-0 md:space-x-6 mb-6">
                <div className="flex items-center space-x-2 text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Lat: {weatherData.latitude.toFixed(2)}, Lon: {weatherData.longitude.toFixed(2)}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Elev: {weatherData.elevation}m</span>
                </div>
              </div>
              
              <WeatherChart data={formattedData} />
              <WeatherTable data={formattedData} />
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <Cloud className="w-12 h-12 mb-3 text-gray-300" />
              <p>Select a file from the sidebar or fetch new data to visualize.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
