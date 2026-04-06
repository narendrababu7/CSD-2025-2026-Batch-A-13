
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { MapMarker, LocationData } from '../types';

// Custom Marker Icons
const createIcon = (color: string) => new L.DivIcon({
  className: 'bg-transparent border-none',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3" fill="white"></circle></svg>`,
  iconSize: [35, 35],
  iconAnchor: [17.5, 33.54], // Mathematically exact bottom tip (23/24 * 35)
  popupAnchor: [0, -35]
});

const icons: Record<string, L.DivIcon> = {
  good: createIcon('#10b981'), // emerald-500
  moderate: createIcon('#f97316'), // orange-500
  critical: createIcon('#ef4444'), // red-500
  blue: createIcon('#8b5cf6') // violet-500
};

const MapUpdater = ({ center, markers, route }: { center: [number, number], markers: MapMarker[], route?: any }) => {
  const map = useMap();
  useEffect(() => {
    if (route && route.path && route.path.length > 0) {
      const routeBounds = L.latLngBounds(route.path);
      map.fitBounds(routeBounds, { padding: [50, 50] });
    } else {
      // Always fly to the center (which is the selected area) with high zoom
      // This ensures the user sees the specific pin they asked for, but others are visible nearby
      map.flyTo(center, 16, { duration: 1.5 });
    }
  }, [center, markers, route, map]);
  return null;
};

const Legend = ({ type }: { type: string }) => {
  const items = (() => {
    switch (type) {
      case 'traffic':
        return [
          { color: 'bg-red-600', label: 'High Density > 80%', icon: 'red' },
          { color: 'bg-orange-400', label: 'Moderate Flow', icon: 'orange' },
          { color: 'bg-green-600', label: 'Low Density', icon: 'green' }
        ];
      case 'electricity':
        return [
          { color: 'bg-red-600', label: 'Overload / Danger', icon: 'red' },
          { color: 'bg-orange-400', label: 'High Load', icon: 'orange' },
          { color: 'bg-green-600', label: 'Stable Operation', icon: 'green' }
        ];
      default:
        return [
          { color: 'bg-red-600', label: 'Critical', icon: 'red' },
          { color: 'bg-orange-400', label: 'Moderate', icon: 'orange' },
          { color: 'bg-green-600', label: 'Normal', icon: 'green' }
        ];
    }
  })();

  return (
    <div className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-xl border border-gray-200 text-xs font-medium w-48 animate-in fade-in slide-in-from-top-4">
      <h4 className="mb-3 font-bold text-gray-800 border-b border-gray-100 pb-2 flex justify-between items-center">
        <span>Map Legend</span>
        <span className="text-[10px] text-gray-400 font-normal uppercase">{type}</span>
      </h4>
      <div className="space-y-2.5">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${item.color} shadow-sm ring-2 ring-white`}></span>
            <span className="text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface MapComponentProps {
  location: LocationData;
  markers: MapMarker[];
  route?: { path: [number, number][]; distance: string; duration: string } | null;
  type: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ location, markers, route, type }) => {
  return (
    <div className="h-full w-full relative group">
      <MapContainer 
        center={[location.lat, location.lng]} 
        zoom={16} 
        style={{ height: '100%', width: '100%' }}
        className="z-0 rounded-xl"
      >
        {/* Switched to OpenStreetMap Standard for clearer road names and locations */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={[location.lat, location.lng]} markers={markers} route={route} />
        
        {markers.map((marker) => (
          <Marker 
            key={marker.id} 
            position={[marker.lat, marker.lng]}
            icon={icons[marker.type] || icons.blue}
          >
            <Tooltip direction="top" offset={[0, -30]} opacity={1} permanent>
              <span className="font-bold text-xs">{marker.label}</span>
            </Tooltip>
            <Popup className="custom-popup">
              <div className="font-sans min-w-[150px]">
                <h3 className="font-bold text-gray-800 border-b pb-1 mb-1">{marker.label}</h3>
                <div className="text-sm text-gray-600 mb-1">{marker.details}</div>
                <div className={`text-xs font-bold uppercase py-0.5 px-1.5 rounded inline-block ${
                  marker.type === 'good' ? 'bg-green-100 text-green-700' : 
                  marker.type === 'moderate' ? 'bg-orange-100 text-orange-700' : 
                  'bg-red-100 text-red-700'
                }`}>
                  {marker.type === 'good' ? 'Normal' : marker.type === 'moderate' ? 'Moderate' : 'Critical'}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {route && (
          <>
            <Polyline 
              positions={route.path} 
              pathOptions={{ color: '#7c3aed', weight: 6, opacity: 0.8, lineCap: 'round' }} 
            />
            {/* Start Marker */}
            <Marker position={route.path[0]} icon={icons.blue} zIndexOffset={100}>
              <Tooltip direction="top" offset={[0, -30]} opacity={1} permanent>Start</Tooltip>
              <Popup>
                <strong>Start</strong><br/>
                Distance: {route.distance}<br/>
                Time: {route.duration}
              </Popup>
            </Marker>
            {/* End Marker */}
            <Marker position={route.path[route.path.length - 1]} icon={icons.blue} zIndexOffset={100}>
              <Tooltip direction="top" offset={[0, -30]} opacity={1} permanent>Destination</Tooltip>
              <Popup><strong>Destination</strong></Popup>
            </Marker>
          </>
        )}
      </MapContainer>
      
      {/* Overlay Legend */}
      <Legend type={type} />
    </div>
  );
};

export default MapComponent;
