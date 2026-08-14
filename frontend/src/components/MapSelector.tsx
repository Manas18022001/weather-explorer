'use client';
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js/Leaflet
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapSelectorProps {
  lat: number;
  lon: number;
  onChange: (lat: number, lon: number) => void;
}

const LocationMarker: React.FC<MapSelectorProps> = ({ lat, lon, onChange }) => {
  const [position, setPosition] = useState<L.LatLng>(new L.LatLng(lat, lon));

  // Sync external changes
  useEffect(() => {
    setPosition(new L.LatLng(lat, lon));
  }, [lat, lon]);

  const map = useMapEvents({
    click(e) {
      const wrapped = e.latlng.wrap();
      const clampedLat = Math.max(-90, Math.min(90, wrapped.lat));
      const clampedLatLng = new L.LatLng(clampedLat, wrapped.lng);
      setPosition(clampedLatLng);
      onChange(parseFloat(clampedLat.toFixed(4)), parseFloat(wrapped.lng.toFixed(4)));
      map.flyTo(clampedLatLng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

const MapSelector: React.FC<MapSelectorProps> = (props) => {
  return (
    <div className="h-64 w-full rounded-xl overflow-hidden border border-gray-300 relative z-0 mb-4 shadow-inner">
      <MapContainer 
        center={[props.lat, props.lon]} 
        zoom={9} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker {...props} />
      </MapContainer>
      <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md text-xs font-semibold text-gray-700 pointer-events-none border border-gray-200">
        📍 Click map to set coordinates
      </div>
    </div>
  );
};

export default MapSelector;
