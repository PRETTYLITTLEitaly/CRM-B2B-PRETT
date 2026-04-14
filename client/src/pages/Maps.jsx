import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const customers = [
  { id: 1, name: 'Tech Gadgets Hub', city: 'Milano', lat: 45.4642, lng: 9.1900, sales: 12500 },
  { id: 2, name: 'Fashion Boutique', city: 'Roma', lat: 41.9028, lng: 12.4964, sales: 9800 },
  { id: 3, name: 'Lombardi Vini', city: 'Firenze', lat: 43.7696, lng: 11.2558, sales: 15600 },
  { id: 4, name: 'Bio Store XL', city: 'Torino', lat: 45.0703, lng: 7.6869, sales: 7200 },
  { id: 5, name: 'Napoli Style', city: 'Napoli', lat: 40.8518, lng: 14.2681, sales: 5400 },
];

const Maps = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-text-main">Mappa Clienti</h2>
          <p className="text-text-dim mt-1">Visualizzazione geografica della rete di vendita.</p>
        </div>
        <div className="flex gap-4">
          <div className="card !py-2 !px-4 flex items-center gap-3">
             <div className="w-3 h-3 rounded-full bg-accent animate-pulse shadow-sm shadow-accent-glow"></div>
             <span className="text-sm font-medium">84 Clienti mappati</span>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-[600px] card !p-0 overflow-hidden relative">
        <MapContainer 
          center={[41.8719, 12.5674]} 
          zoom={6} 
          style={{ height: '100%', width: '100%', background: '#0c0d12' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {customers.map((c) => (
            <Marker key={c.id} position={[c.lat, c.lng]}>
              <Popup>
                <div className="p-2 text-primary">
                  <h4 className="font-bold text-accent">{c.name}</h4>
                  <p className="text-xs text-gray-400 mt-1">{c.city}</p>
                  <div className="mt-2 text-sm font-bold">
                    Vendite: €{c.sales.toLocaleString()}
                  </div>
                  <button className="mt-2 w-full bg-accent text-white text-[10px] font-bold py-1 rounded">
                    Vedi Profilo
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {/* Overlay Legend */}
        <div className="absolute bottom-6 left-6 z-[1000] glass p-4 rounded-xl border-border w-64">
           <h4 className="text-sm font-bold mb-3">Legenda Regioni</h4>
           <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                 <span className="text-text-dim">Nord Italia</span>
                 <span className="font-bold text-success">42%</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-success w-[42%] rounded-full"></div>
              </div>

              <div className="flex items-center justify-between text-xs mt-3">
                 <span className="text-text-dim">Centro Italia</span>
                 <span className="font-bold text-accent">35%</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-accent w-[35%] rounded-full"></div>
              </div>

              <div className="flex items-center justify-between text-xs mt-3">
                 <span className="text-text-dim">Sud e Isole</span>
                 <span className="font-bold text-warning">23%</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-warning w-[23%] rounded-full"></div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Maps;
