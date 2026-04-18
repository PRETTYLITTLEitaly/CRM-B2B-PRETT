import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { 
  Map as MapIcon, 
  Users, 
  MapPin, 
  Search, 
  Navigation, 
  ChevronRight,
  Target,
  UserCheck
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente per muovere la mappa
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

const Maps = () => {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([41.8719, 12.5674]);
  const [zoom, setZoom] = useState(6);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/maps/points');
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        const dedupedMap = new Map();
        json.data.forEach(p => {
          if (!p.name) return dedupedMap.set(p.id, p);
          
          const key = (p.type + '-' + p.name.trim().toLowerCase());
          if (dedupedMap.has(key)) {
             const existing = dedupedMap.get(key);
             // Se l'esistente non ha coordinate ma il nuovo sì, aggiorniamo
             if (!existing.lat && p.lat) {
               existing.lat = p.lat;
               existing.lng = p.lng;
             }
          } else {
            dedupedMap.set(key, { ...p });
          }
        });
        setPoints(Array.from(dedupedMap.values()));
      } else {
        setPoints([]);
      }
    } catch (err) {
      console.error('Fetch map error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPoints = points.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.city.toLowerCase().includes(search.toLowerCase())
  );

  const handlePointClick = (p) => {
    if (p.lat && p.lng) {
      setMapCenter([p.lat, p.lng]);
      setZoom(12);
    }
  };

  // Creazione Icone Custom (Basic CSS markers per ora poichè gli SVG reali richiedono più codice)
  const createIcon = (color) => L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });

  // Helper per mappare province/città alle Regioni Italiane
  const getMacroRegion = (regionOrCity) => {
    if (!regionOrCity) return 'Altro';
    const val = regionOrCity.toUpperCase();
    
    const mapping = {
      'CAMPANIA': ['NAPOLI', 'SALERNO', 'CASERTA', 'BENEVENTO', 'AVELLINO'],
      'PUGLIA': ['BARI', 'BARLETTA-ANDRIA-TRANI', 'BRINDISI', 'FOGGIA', 'LECCE', 'TARANTO'],
      'LAZIO': ['ROMA', 'FROSINONE', 'LATINA', 'RIETI', 'VITERBO'],
      'LOMBARDIA': ['MILANO', 'BERGAMO', 'BRESCIA', 'COMO', 'CREMONA', 'LECCO', 'LODI', 'MANTOVA', 'MONZA E BRIANZA', 'PAVIA', 'SONDRIO', 'VARESE'],
      'EMILIA-ROMAGNA': ['BOLOGNA', 'FERRARA', 'FORLÌ-CESENA', 'MODENA', 'PARMA', 'PIACENZA', 'RAVENNA', 'REGGIO EMILIA', 'RIMINI'],
      'SICILIA': ['PALERMO', 'AGRIGENTO', 'CALTANISSETTA', 'CATANIA', 'ENNA', 'MESSINA', 'RAGUSA', 'SIRACUSA', 'TRAPANI'],
      'VENETO': ['VENEZIA', 'PADOVA', 'VERONA', 'VICENZA', 'TREVISO', 'ROVIGO', 'BELLUNO'],
      'PIEMONTE': ['TORINO', 'ALESSANDRIA', 'ASTI', 'BIELLA', 'CUNEO', 'NOVARA', 'VERBANIA', 'VERCELLI'],
      'TOSCANA': ['FIRENZE', 'AREZZO', 'GROSSETO', 'LIVORNO', 'LUCCA', 'MASSA-CARRARA', 'PISA', 'PISTOIA', 'PRATO', 'SIENA'],
      'CALABRIA': ['CATANZARO', 'COSENZA', 'CROTONE', 'REGGIO CALABRIA', 'VIBO VALENTIA'],
      'SARDEGNA': ['CAGLIARI', 'NUORO', 'ORISTANO', 'SASSARI', 'SUD SARDEGNA'],
      'LIGURIA': ['GENOVA', 'IMPERIA', 'LA SPEZIA', 'SAVONA'],
      'MARCHE': ['ANCONA', 'ASCOLI PICENO', 'FERMO', 'MACERATA', 'PESARO E URBINO'],
      'ABRUZZO': ['L\'AQUILA', 'CHIETI', 'PESCARA', 'TERAMO'],
      'FRIULI-VENEZIA GIULIA': ['TRIESTE', 'GORIZIA', 'PORDENONE', 'UDINE'],
      'TRENTINO-ALTO ADIGE': ['TRENTO', 'BOLZANO'],
      'UMBRIA': ['PERUGIA', 'TERNI'],
      'BASILICATA': ['POTENZA', 'MATERA'],
      'MOLISE': ['CAMPOBASSO', 'ISERNIA'],
      'VALLE D\'AOSTA': ['AOSTA']
    };

    for (const [region, cities] of Object.entries(mapping)) {
      if (val === region || cities.includes(val)) return region;
    }
    return val; // Fallback al valore originale se non mappato
  };

  const [expandedRegions, setExpandedRegions] = useState({});

  const toggleRegion = (region) => {
    setExpandedRegions(prev => ({
      ...prev,
      [region]: !prev[region]
    }));
  };

  // Raggruppamento per MACRO REGIONE o STATO ESTERO
  const groupedByRegion = filteredPoints.reduce((acc, p) => {
    let groupName = 'Italia';
    if (p.country && p.country.toUpperCase() !== 'ITALIA' && p.country.toUpperCase() !== 'ITALY') {
      groupName = p.country.toUpperCase();
    } else {
      groupName = getMacroRegion(p.region || p.city);
    }
    
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(p);
    return acc;
  }, {});

  // Ordinamento regioni per numero di clienti (discendente)
  const sortedRegionKeys = Object.keys(groupedByRegion).sort((a, b) => 
    groupedByRegion[b].length - groupedByRegion[a].length
  );

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase flex items-center gap-3">
            <MapIcon className="w-8 h-8 text-indigo-600" /> Rete <span className="text-indigo-600">Geografica.</span>
          </h1>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
            {points.length} Punti vendita mappati in tutta Italia
          </p>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Cerca per nome o città..." 
            className="pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-indigo-600/20 transition-all w-64 uppercase tracking-tighter"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        
        {/* Map View */}
        <div className="flex-1 card overflow-hidden !p-0 border-4 border-white shadow-2xl rounded-[3rem] relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-[1000] flex items-center justify-center">
              <Navigation className="w-12 h-12 text-indigo-600 animate-pulse" />
            </div>
          )}
          <MapContainer 
            center={mapCenter} 
            zoom={zoom} 
            style={{ height: '100%', width: '100%' }}
            className="z-10"
          >
            <ChangeView center={mapCenter} zoom={zoom} />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {filteredPoints.filter(p => p.lat).map((p) => (
              <Marker 
                key={p.id} 
                position={[p.lat, p.lng]}
                icon={createIcon(p.markerColor === 'emerald' ? '#10b981' : p.markerColor === 'rose' ? '#f43f5e' : p.markerColor === 'amber' ? '#f59e0b' : '#4f46e5')}
              >
                <Popup className="custom-popup">
                  <div className="p-2 space-y-2">
                    <div className="flex items-center gap-2">
                       {p.type === 'CUSTOMER' ? <UserCheck className="w-3 h-3 text-emerald-500" /> : <Target className="w-3 h-3 text-indigo-600" />}
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{p.type}</span>
                    </div>
                    <h4 className="font-black text-slate-900 leading-tight uppercase tracking-tight">{p.name}</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{p.city} ({p.region})</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Sidebar List (Accordion Style) */}
        <div className="w-full lg:w-96 flex flex-col gap-6 overflow-hidden">
          <div className="flex-1 bg-white border border-slate-100 rounded-[3rem] shadow-sm flex flex-col overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest italic flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" /> Distribuzione Clienti
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 pb-20 custom-scrollbar">
              {sortedRegionKeys.map(region => (
                <div key={region} className="mb-2 last:mb-0 border border-slate-50 rounded-[2rem] overflow-hidden transition-all duration-300">
                  <button 
                    onClick={() => toggleRegion(region)}
                    className={`w-full flex items-center justify-between px-6 py-4 transition-all ${expandedRegions[region] ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-900 hover:bg-slate-100'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${expandedRegions[region] ? 'text-white' : 'text-slate-400'}`}>
                        {region}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${expandedRegions[region] ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
                        {groupedByRegion[region].length}
                      </span>
                      <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${expandedRegions[region] ? 'rotate-90' : ''}`} />
                    </div>
                  </button>

                  <div className={`overflow-hidden transition-all duration-500 ${expandedRegions[region] ? 'max-h-[9999px] opacity-100 p-2' : 'max-h-0 opacity-0'}`}>
                    <div className="space-y-1">
                      {groupedByRegion[region].map(p => (
                        <button 
                          key={p.id}
                          onClick={() => handlePointClick(p)}
                          className="w-full text-left p-4 rounded-xl hover:bg-slate-50 transition-all group flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${p.type === 'CUSTOMER' ? 'bg-emerald-500' : 'bg-indigo-600'}`}></div>
                            <div>
                              <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                                {p.name}
                              </p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                                {p.city}
                              </p>
                            </div>
                          </div>
                          {p.lat && (
                            <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                               <MapPin className="w-3 h-3 text-emerald-600" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              
              {points.length === 0 && !loading && (
                <div className="p-12 text-center opacity-30 flex flex-col items-center gap-4">
                  <MapPin className="w-12 h-12" />
                  <p className="text-xs font-black uppercase italic">Nessun punto trovato</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Maps;
