/* -------------------------------------------------------------------------- */
/* TRIPS Bike Annotation - Session Setup & Workspace Loader                   */
/* -------------------------------------------------------------------------- */

import React, { useState } from 'react';
import { Shield, Plus, Map as MapIcon, FileJson } from 'lucide-react';
import { GPSPoint, Annotation, ProjectData } from '../../types';

interface SessionSetupModalProps {
  onStart: (
    front: File | null, 
    back: File | null, 
    gps: GPSPoint[], 
    annotations?: Annotation[], 
    id?: string,
    fingerprint?: string
  ) => void;
  onClose: () => void;
  isResuming: boolean;
}

const SessionSetupModal: React.FC<SessionSetupModalProps> = ({ onStart, onClose, isResuming }) => {
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [gpxFile, setGpxFile] = useState<File | null>(null);
  const [tripsFile, setTripsFile] = useState<File | null>(null);
  const [userId, setUserId] = useState('');

  // Helper to generate the unique session fingerprint
  const generateFingerprint = (front: File, back: File, gpx: File): string => {
    return `${front.name}-${front.size}-${back.name}-${back.size}-${gpx.name}`;
  };

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
    if (!frontFile || !backFile || !gpxFile) return;

    const currentFingerprint = generateFingerprint(frontFile, backFile, gpxFile);
    let gpsPoints: GPSPoint[] = [];
    let importedAnnotations: Annotation[] | undefined = undefined;
    let finalUserId = userId;

    // 1. Process Mandatory GPX
    try {
      const gpxText = await gpxFile.text();
      gpsPoints = parseGPX(gpxText);
    } catch (err) {
      console.error("GPX Parse Error", err);
      alert("Error parsing GPX file.");
      return;
    }

    // 2. Process Optional .trips hydration with Validation
    if (tripsFile) {
      try {
        const tripsText = await tripsFile.text();
        const parsed: ProjectData = JSON.parse(tripsText);

        // Validation Check
        if (parsed.fingerprint && parsed.fingerprint !== currentFingerprint) {
          const proceed = window.confirm(
            "FILE MISMATCH: This .trips file was created with different video or GPS data. " +
            "Timestamps may be inaccurate. Do you want to load it anyway?"
          );
          if (!proceed) return;
        }

        importedAnnotations = parsed.annotations || [];
        if (parsed.userId && !finalUserId) finalUserId = parsed.userId;
      } catch (err) {
        console.error("Failed to parse .trips file", err);
        alert("The .trips file is invalid.");
        return;
      }
    }

    onStart(frontFile, backFile, gpsPoints, importedAnnotations, finalUserId, currentFingerprint);
  };

  const canStart = frontFile && backFile && gpxFile;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-6">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-indigo-500/20 rounded-2xl">
            <Shield className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Session Setup</h2>
            <p className="text-slate-400 text-sm">Upload media and GPS to begin</p>
          </div>
        </div>

        <div className="space-y-6">
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

          <div className="grid grid-cols-2 gap-4">
            <VideoUploadField label="Front Cam (Required)" file={frontFile} setFile={setFrontFile} />
            <VideoUploadField label="Rear Cam (Required)" file={backFile} setFile={setBackFile} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">GPS (.gpx)</label>
              <FileUploadField 
                file={gpxFile} 
                setFile={setGpxFile} 
                accept=".gpx" 
                icon={<MapIcon className={`w-5 h-5 mx-auto mb-2 ${gpxFile ? 'text-indigo-400' : 'text-slate-500'}`} />}
                placeholder="Required"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Resume (.trips)</label>
              <FileUploadField 
                file={tripsFile} 
                setFile={setTripsFile} 
                accept=".trips" 
                icon={<FileJson className={`w-5 h-5 mx-auto mb-2 ${tripsFile ? 'text-amber-400' : 'text-slate-500'}`} />}
                placeholder="Optional"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 flex gap-4">
          <button onClick={onClose} className="flex-1 px-6 py-3 rounded-xl border border-slate-800 text-slate-500 text-sm font-bold hover:bg-slate-800 hover:text-slate-300 transition-all">
            Cancel
          </button>
          <button 
            disabled={!canStart}
            onClick={handleBegin}
            className="flex-[2] px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 disabled:opacity-20 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
          >
            {tripsFile ? 'Restore & Begin' : 'Begin Session'}
          </button>
        </div>
      </div>
    </div>
  );
};

const VideoUploadField: React.FC<{ label: string, file: File | null, setFile: (f: File | null) => void }> = ({ label, file, setFile }) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{label}</label>
    <div className="relative group">
      <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
      <div className={`p-4 border-2 border-dashed rounded-2xl text-center transition-all ${file ? 'border-green-500/50 bg-green-500/10' : 'border-slate-800 hover:border-slate-700'}`}>
        <Plus className={`w-5 h-5 mx-auto mb-2 ${file ? 'text-green-400' : 'text-slate-500'}`} />
        <span className="text-[10px] font-bold block truncate text-slate-300 px-2">{file ? file.name : 'Select MP4'}</span>
      </div>
    </div>
  </div>
);

const FileUploadField: React.FC<{ file: File | null, setFile: (f: File | null) => void, accept: string, icon: React.ReactNode, placeholder: string }> = ({ file, setFile, accept, icon, placeholder }) => (
  <div className="relative group">
    <input type="file" accept={accept} onChange={(e) => setFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
    <div className={`p-4 border-2 border-dashed rounded-2xl text-center transition-all ${file ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-slate-800 hover:border-slate-700'}`}>
      {icon}
      <span className="text-[9px] font-black block truncate text-slate-300 px-1 uppercase tracking-tighter">
        {file ? file.name : placeholder}
      </span>
    </div>
  </div>
);

export default SessionSetupModal;