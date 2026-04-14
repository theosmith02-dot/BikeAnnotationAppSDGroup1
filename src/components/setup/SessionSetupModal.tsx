/* -------------------------------------------------------------------------- */
/* TRIPS Bike Annotation - Session Setup & Workspace Loader                   */
/* -------------------------------------------------------------------------- */

import React, { useState } from 'react';
import { Shield, Plus, Map as MapIcon } from 'lucide-react';
import { GPSPoint, Annotation } from '../../types';

interface SessionSetupModalProps {
  onStart: (
    front: File | null, 
    back: File | null, 
    gps: GPSPoint[], 
    annotations?: Annotation[], 
    id?: string
  ) => void;
  onClose: () => void;
  isResuming: boolean;
}

const SessionSetupModal: React.FC<SessionSetupModalProps> = ({ onStart, onClose, isResuming }) => {
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [dataFile, setDataFile] = useState<File | null>(null);
  const [userId, setUserId] = useState('');

  // Local helper to parse GPX XML specifically
  const parseGPX = (text: string): GPSPoint[] => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml");
    const trackPoints = Array.from(xmlDoc.querySelectorAll("trkpt"));
    if (trackPoints.length === 0) return [];

    const startTimeStr = trackPoints[0].querySelector("time")?.textContent;
    const startTime = startTimeStr ? new Date(startTimeStr).getTime() : 0;

    return trackPoints.map((pt) => {
      const timeStr = pt.querySelector("time")?.textContent;
      const pointTime = timeStr ? new Date(timeStr).getTime() : 0;
      return {
        lat: parseFloat(pt.getAttribute("lat") || "0"),
        lng: parseFloat(pt.getAttribute("lon") || "0"),
        timestamp: (pointTime - startTime) / 1000
      };
    });
  };

  const handleBegin = async () => {
    let gpsPoints: GPSPoint[] = [];
    let importedAnnotations: Annotation[] | undefined = undefined;
    let finalUserId = userId;

    if (dataFile) {
      const text = await dataFile.text();

      if (dataFile.name.endsWith('.trips')) {
        // --- WORKSPACE RESTORATION LOGIC ---
        try {
          const parsed = JSON.parse(text);
          if (parsed.annotations) {
            importedAnnotations = parsed.annotations;
            gpsPoints = parsed.gpsData || [];
            if (parsed.userId && !finalUserId) finalUserId = parsed.userId;
          }
        } catch (err) {
          console.error("Failed to parse .trips workspace file", err);
        }
      } else if (dataFile.name.endsWith('.gpx')) {
        // --- STANDARD GPX INGESTION ---
        gpsPoints = parseGPX(text);
      }
    }

    // Trigger onStart with the validated data
    onStart(frontFile, backFile, gpsPoints, importedAnnotations, finalUserId);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-6">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-indigo-500/20 rounded-2xl">
            <Shield className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Session Setup</h2>
            <p className="text-slate-400 text-sm">Upload media or resume a .trips workspace</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Annotator ID */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
              Annotator Name / ID
            </label>
            <input 
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="UserID"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          {/* Video Selection Grid */}
          <div className="grid grid-cols-2 gap-4">
            <VideoUploadField label="Front Cam" file={frontFile} setFile={setFrontVideo => setFrontFile(setFrontVideo)} />
            <VideoUploadField label="Rear Cam" file={backFile} setFile={setBackVideo => setBackFile(setBackVideo)} />
          </div>

          {/* Data Ingestion (GPX or TRIPS) */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
              Data File (.gpx or .trips)
            </label>
            <div className="relative group">
              <input 
                type="file" 
                accept=".gpx,.trips" 
                onChange={(e) => setDataFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              />
              <div className={`p-6 border-2 border-dashed rounded-2xl text-center transition-all ${
                dataFile ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-slate-800 hover:border-slate-700'
              }`}>
                <MapIcon className={`w-6 h-6 mx-auto mb-2 ${dataFile ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span className="text-[11px] font-bold block text-slate-300">
                  {dataFile ? dataFile.name : 'Click to upload telemetry'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-10 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl border border-slate-800 text-slate-500 text-sm font-bold hover:bg-slate-800 hover:text-slate-300 transition-all"
          >
            Cancel
          </button>
          <button 
            disabled={!frontFile && !isResuming && !dataFile?.name.endsWith('.trips')}
            onClick={handleBegin}
            className="flex-[2] px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
          >
            {dataFile?.name.endsWith('.trips') ? 'Resume Workspace' : 'Begin Session'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* --- Internal Helper Component --- */
const VideoUploadField: React.FC<{
  label: string, 
  file: File | null, 
  setFile: (f: File | null) => void
}> = ({ label, file, setFile }) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{label}</label>
    <div className="relative group">
      <input 
        type="file" 
        accept="video/*" 
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
      />
      <div className={`p-4 border-2 border-dashed rounded-2xl text-center transition-all ${
        file ? 'border-green-500/50 bg-green-500/10' : 'border-slate-800 hover:border-slate-700'
      }`}>
        <Plus className={`w-5 h-5 mx-auto mb-2 ${file ? 'text-green-400' : 'text-slate-500'}`} />
        <span className="text-[10px] font-bold block truncate text-slate-300 px-2">
          {file ? file.name : 'Select MP4'}
        </span>
      </div>
    </div>
  </div>
);

export default SessionSetupModal;