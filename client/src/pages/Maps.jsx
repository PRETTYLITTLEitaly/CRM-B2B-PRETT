import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Maps = () => {
  const positions = [
    { name: 'Store Milano 1', pos: [45.4642, 9.1900], type: 'Attivo' },
    { name: 'Store Roma 1', pos: [41.9028, 12.4964], type: 'Lead' },
    { name: 'Store Napoli 1', pos: [40.8518, 14.2681], type: 'Attivo' },
  ];

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter italic uppercase">
          Analisi <span className="text-indigo-600">Geografica.</span>
        </h1>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attivi</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Leads</span>
          </div>
        </div>
      </div>

      <div className="flex-1 card overflow-hidden !p-0 min-h-[600px] border-4 border-white">
        <MapContainer 
          center={[41.8719, 12.5674]} 
          zoom={6} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {positions.map((p, i) => (
            <Marker key={i} position={p.pos}>
              <Popup>
                <div className="p-2">
                  <h4 className="font-bold">{p.name}</h4>
                  <p className="text-xs text-slate-500">{p.type}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default Maps;
