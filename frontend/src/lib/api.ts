import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface WeatherFile {
  name: string;
  size: number;
  created_at: string;
}

export interface StoreWeatherRequest {
  latitude: number;
  longitude: number;
  start_date: string;
  end_date: string;
}

export const storeWeatherData = async (data: StoreWeatherRequest) => {
  const response = await api.post('store-weather-data', data);
  return response.data;
};

export const listWeatherFiles = async (): Promise<WeatherFile[]> => {
  const response = await api.get('list-weather-files');
  return response.data.files;
};

export const getWeatherFileContent = async (fileName: string) => {
  const response = await api.get(`weather-file-content/${encodeURIComponent(fileName)}`);
  return response.data;
};
