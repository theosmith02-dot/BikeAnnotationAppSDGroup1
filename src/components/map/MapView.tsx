/* -------------------------------------------------------------------------- */
/* MapView.tsx - Final Optimized Version                                      */
/* Standardized to 'lng' | Smooth Gliding Tracking | Toggle Layers            */
/* -------------------------------------------------------------------------- */

import React, { useEffect, useRef, useCallback } from 'react';
import { Target, Plus, Minus } from 'lucide-react';
import { GPSPoint } from '../../types';

// External Leaflet declaration
declare const L: any;

interface MapViewProps {
  gpsData: GPSPoint[];
  currentTime: number;
  isAutoCentering: boolean;
  setIsAutoCentering: (val: boolean) => void;
}

const MapView: React.FC<MapViewProps> = ({ gpsData, currentTime, isAutoCentering, setIsAutoCentering }) => {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const requestRef = useRef<number>();

  // 1. DATA INTERPOLATION ENGINE
  const getInterpolatedGPS = useCallback((time: number) => {
    if (!gpsData || gpsData.length === 0) return null;
    
    if (time <= gpsData[0].timestamp) return [gpsData[0].lat, gpsData[0].lng];
    if (time >= gpsData[gpsData.length - 1].timestamp) {
      const last = gpsData[gpsData.length - 1];
      return [last.lat, last.lng];
    }

    let nextIdx = gpsData.findIndex((p) => p.timestamp > time);
    if (nextIdx === -1) nextIdx = gpsData.length - 1;
    const prevIdx = Math.max(0, nextIdx - 1);
    const p1 = gpsData[prevIdx];
    const p2 = gpsData[nextIdx];

    if (p2.timestamp === p1.timestamp) return [p1.lat, p1.lng];

    const ratio = (time - p1.timestamp) / (p2.timestamp - p1.timestamp);
    return [
      p1.lat + (p2.lat - p1.lat) * ratio,
      p1.lng + (p2.lng - p1.lng) * ratio
    ];
  }, [gpsData]);

  // 2. INITIALIZATION
  useEffect(() => {
    if (gpsData.length > 0 && !mapRef.current) {
      const container = document.getElementById('map-container');
      if (container) {
        // Define Base Layers
        const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
          maxZoom: 19 
        });
        
        const satelliteLayer = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', 
          {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
          }
        );

        // Map Instance
        mapRef.current = L.map('map-container', {
          zoomControl: false,
          attributionControl: false,
          layers: [streetLayer],
          fadeAnimation: true,
          markerZoomAnimation: true
        }).setView([gpsData[0].lat, gpsData[0].lng], 18);

        // Layer Picker (Bottom Right per your latest revision)
        const baseMaps = { "Streets": streetLayer, "Satellite": satelliteLayer };
        L.control.layers(baseMaps, null, { position: 'bottomright' }).addTo(mapRef.current);

        // Custom Rider Marker (The Indigo Dot)
        const riderIcon = L.divIcon({
          className: 'custom-rider-marker',
          html: `<div class="w-3.5 h-3.5 bg-indigo-500 border-2 border-white rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        markerRef.current = L.marker([gpsData[0].lat, gpsData[0].lng], { icon: riderIcon }).addTo(mapRef.current);
        
        // Full Trail Path
        const path = gpsData.map((p) => [p.lat, p.lng]);
        polylineRef.current = L.polyline(path, { color: '#6366f1', weight: 4, opacity: 0.5 }).addTo(mapRef.current);

        // Interaction Listeners
        mapRef.current.on('dragstart', () => setIsAutoCentering(false));
        mapRef.current.on('zoomstart', () => setIsAutoCentering(false));
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [gpsData, setIsAutoCentering]);

  // 3. SMOOTH SYNC ENGINE
  useEffect(() => {
    if (!mapRef.current || !markerRef.current || gpsData.length === 0) return;

    const pos = getInterpolatedGPS(currentTime);
    if (pos) {
      markerRef.current.setLatLng(pos);
      if (isAutoCentering) {
        // panTo with easeLinearity for high-precision tracking
        mapRef.current.panTo(pos, { 
          animate: true, 
          duration: 0.1, 
          easeLinearity: 1.0 
        });
      }
    }
  }, [currentTime, gpsData, isAutoCentering, getInterpolatedGPS]);

  // UI HANDLERS
  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleRecenter = () => {
    if (markerRef.current) {
      const pos = markerRef.current.getLatLng();
      mapRef.current.setView(pos, 18, { animate: true });
      setIsAutoCentering(true);
    }
  };

  return (
    <div className="w-full h-full relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group">
      {/* Map Container */}
      <div id="map-container" className="absolute inset-0 z-0 h-full w-full" />
      
      {/* Control Dock (Top Right) */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1 bg-slate-900/80 backdrop-blur-md border border-slate-700 p-1.5 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button 
          onClick={handleZoomIn} 
          className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors"
          title="Zoom In"
        >
          <Plus size={14} strokeWidth={2.5} />
        </button>
        <button 
          onClick={handleZoomOut} 
          className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors"
          title="Zoom Out"
        >
          <Minus size={14} strokeWidth={2.5} />
        </button>
        <div className="h-px bg-slate-700 mx-1 my-0.5" />
        <button
          onClick={handleRecenter}
          className={`p-1.5 rounded-lg transition-all ${
            isAutoCentering ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'
          }`}
          title="Recenter & Follow"
        >
          <Target size={14} strokeWidth={2.5} />
        </button>
      </div>

      {/* Coordinates (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-[400] px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded text-[8px] text-slate-400 font-mono border border-white/5 pointer-events-none">
        {markerRef.current 
          ? `${markerRef.current.getLatLng().lat.toFixed(5)}, ${markerRef.current.getLatLng().lng.toFixed(5)}` 
          : 'Syncing GPS...'}
      </div>
    </div>
  );
};

export default MapView;