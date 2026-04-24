/* -------------------------------------------------------------------------- */
/* MapView.tsx - Final Optimized Version with Annotation Markers              */
/* -------------------------------------------------------------------------- */

import React, { useEffect, useRef, useCallback } from 'react';
import { Target, Plus, Minus } from 'lucide-react';
import { GPSPoint, Annotation } from '../../types';

declare const L: any;

interface MapViewProps {
  gpsData: GPSPoint[];
  annotations: Annotation[]; // New Prop
  currentTime: number;
  isAutoCentering: boolean;
  setIsAutoCentering: (val: boolean) => void;
  onSeek: (time: number) => void; // New Prop for clicking markers
}

const MapView: React.FC<MapViewProps> = ({ 
  gpsData, 
  annotations, 
  currentTime, 
  isAutoCentering, 
  setIsAutoCentering,
  onSeek 
}) => {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const annotationLayerRef = useRef<any>(null); // New Layer for pins

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

    const ratio = (time - p1.timestamp) / (p2.timestamp - p1.timestamp);
    return [
      p1.lat + (p2.lat - p1.lat) * ratio,
      p1.lng + (p2.lng - p1.lng) * ratio
    ];
  }, [gpsData]);

  // 2. INITIALIZATION
  useEffect(() => {
    if (gpsData.length > 0 && !mapRef.current) {
      const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 });
      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');

      mapRef.current = L.map('map-container', {
        zoomControl: false,
        attributionControl: false,
        layers: [streetLayer]
      }).setView([gpsData[0].lat, gpsData[0].lng], 18);

      const baseMaps = { "Streets": streetLayer, "Satellite": satelliteLayer };
      L.control.layers(baseMaps, null, { position: 'bottomright' }).addTo(mapRef.current);

      // Rider Icon
      const riderIcon = L.divIcon({
        className: 'custom-rider-marker',
        html: `<div class="w-3.5 h-3.5 bg-indigo-500 border-2 border-white rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      markerRef.current = L.marker([gpsData[0].lat, gpsData[0].lng], { icon: riderIcon, zIndexOffset: 1000 }).addTo(mapRef.current);
      
      const path = gpsData.map((p) => [p.lat, p.lng]);
      polylineRef.current = L.polyline(path, { color: '#6366f1', weight: 4, opacity: 0.5 }).addTo(mapRef.current);

      // Initialize Annotation Layer
      annotationLayerRef.current = L.layerGroup().addTo(mapRef.current);

      mapRef.current.on('dragstart', () => setIsAutoCentering(false));
      mapRef.current.on('zoomstart', () => setIsAutoCentering(false));
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [gpsData, setIsAutoCentering]);

  // 3. ANNOTATION MARKER UPDATER
  useEffect(() => {
    if (!mapRef.current || !annotationLayerRef.current) return;

    // Clear existing pins
    annotationLayerRef.current.clearLayers();

    annotations.forEach((ann) => {
      const pos = getInterpolatedGPS(ann.timestamp);
      if (pos) {
        // Map UI colors to hex
        const pinColor = ann.color === 'red' ? '#ef4444' : ann.color === 'purple' ? '#a855f7' : '#64748b';
        
        const annIcon = L.divIcon({
          className: 'annotation-pin',
          html: `<div class="w-3 h-3 rounded-full border-2 border-white shadow-lg transition-transform hover:scale-150" style="background-color: ${pinColor}"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });

        const m = L.marker(pos, { icon: annIcon })
          .bindTooltip(`<div class="bg-slate-900 text-white text-[10px] px-2 py-1 rounded border border-slate-700 font-bold">${ann.value}</div>`, { direction: 'top', offset: [0, -5] })
          .on('click', () => {
            onSeek(ann.timestamp);
            setIsAutoCentering(false);
          });
        
        annotationLayerRef.current.addLayer(m);
      }
    });
  }, [annotations, getInterpolatedGPS, onSeek, setIsAutoCentering]);

  // 4. SMOOTH SYNC ENGINE
  useEffect(() => {
    if (!mapRef.current || !markerRef.current || gpsData.length === 0) return;

    const pos = getInterpolatedGPS(currentTime);
    if (pos) {
      markerRef.current.setLatLng(pos);
      if (isAutoCentering) {
        mapRef.current.panTo(pos, { animate: true, duration: 0.1, easeLinearity: 1.0 });
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
      <div id="map-container" className="absolute inset-0 z-0 h-full w-full" />
      
      <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1 bg-slate-900/80 backdrop-blur-md border border-slate-700 p-1.5 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button onClick={handleZoomIn} className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors" title="Zoom In">
          <Plus size={14} strokeWidth={2.5} />
        </button>
        <button onClick={handleZoomOut} className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors" title="Zoom Out">
          <Minus size={14} strokeWidth={2.5} />
        </button>
        <div className="h-px bg-slate-700 mx-1 my-0.5" />
        <button
          onClick={handleRecenter}
          className={`p-1.5 rounded-lg transition-all ${isAutoCentering ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}
          title="Recenter & Follow"
        >
          <Target size={14} strokeWidth={2.5} />
        </button>
      </div>

      <div className="absolute bottom-3 left-3 z-[400] px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded text-[8px] text-slate-400 font-mono border border-white/5 pointer-events-none">
        {markerRef.current 
          ? `${markerRef.current.getLatLng().lat.toFixed(5)}, ${markerRef.current.getLatLng().lng.toFixed(5)}` 
          : 'Syncing GPS...'}
      </div>
    </div>
  );
};

export default MapView;