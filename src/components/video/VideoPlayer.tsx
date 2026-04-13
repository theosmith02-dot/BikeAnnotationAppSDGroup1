/* -------------------------------------------------------------------------- */
/* TRIPS Bike Annotation - Video Sync Engine                                  */
/* -------------------------------------------------------------------------- */

import React, { useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { Play, Pause, Droplets, Map as MapIcon, HardHat } from 'lucide-react';
import { ActiveStates } from '../../types';

interface VideoPlayerProps {
  frontUrl: string | undefined;
  backUrl: string | undefined;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isMuted: boolean;
  isSwapped: boolean;
  playbackRate: number; // Added for speed sync
  activeStates: ActiveStates;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
}

const VideoPlayer = forwardRef((props: VideoPlayerProps, ref) => {
  const {
    frontUrl, backUrl, currentTime, duration, isPlaying,
    isMuted, isSwapped, playbackRate, activeStates, onTimeUpdate,
    onDurationChange, onTogglePlay, onSeek
  } = props;

  const frontRef = useRef<HTMLVideoElement>(null);
  const backRef = useRef<HTMLVideoElement>(null);
  const miniFrontRef = useRef<HTMLVideoElement>(null);
  const miniBackRef = useRef<HTMLVideoElement>(null);

  const allRefs = [frontRef, backRef, miniFrontRef, miniBackRef];

  // Expose functions to App.tsx
  useImperativeHandle(ref, () => ({
    getRef: () => (isSwapped ? backRef.current : frontRef.current),
    syncAll: (time: number) => {
      allRefs.forEach(r => {
        if (r.current && Math.abs(r.current.currentTime - time) > 0.1) {
          r.current.currentTime = time;
        }
      });
    }
  }));

  // Sync Play/Pause
  useEffect(() => {
    allRefs.forEach(r => {
      if (!r.current) return;
      isPlaying ? r.current.play().catch(() => {}) : r.current.pause();
    });
  }, [isPlaying]);

  // Sync Playback Speed (New)
  useEffect(() => {
    allRefs.forEach(r => {
      if (r.current) {
        r.current.playbackRate = playbackRate;
      }
    });
  }, [playbackRate]);

  return (
    <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
      {/* --- PRIMARY VIDEO VIEW --- */}
      <div 
        className="col-span-8 relative bg-black rounded-2xl overflow-hidden border border-slate-800 group shadow-2xl cursor-pointer"
        onClick={onTogglePlay}
      >
        <video
          ref={frontRef}
          src={frontUrl}
          muted={isMuted}
          className={`absolute inset-0 w-full h-full object-contain transition-all duration-300 ${
            isSwapped ? 'opacity-0 scale-95' : 'opacity-100 scale-100 z-10'
          }`}
          onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
          onDurationChange={(e) => onDurationChange(e.currentTarget.duration)}
          playsInline
        />
        <video
          ref={backRef}
          src={backUrl}
          muted={isMuted || !isSwapped}
          className={`absolute inset-0 w-full h-full object-contain transition-all duration-300 ${
            !isSwapped ? 'opacity-0 scale-95' : 'opacity-100 scale-100 z-10'
          }`}
          playsInline
        />

        {/* HUD Overlay */}
        <div 
          className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-4">
            <button onClick={onTogglePlay} className="p-2 bg-white rounded-xl text-black hover:bg-indigo-500 hover:text-white transition-colors">
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <input
              type="range"
              min="0"
              max={duration || 1}
              step="0.1"
              value={currentTime}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="flex-1 accent-indigo-500 h-1 rounded-lg appearance-none bg-slate-700 cursor-pointer"
            />
          </div>
        </div>

        {/* Environment Status Badges - Respecting "Null State" */}
        <div className="absolute top-4 left-4 z-20 flex gap-2" onClick={(e) => e.stopPropagation()}>
          <StatusBadge 
            icon={<Droplets className={`w-3 h-3 ${activeStates.weather ? 'text-blue-400' : 'text-slate-600'}`} />} 
            label={activeStates.weather || 'Weather ?'} 
          />
          <StatusBadge 
            icon={<MapIcon className={`w-3 h-3 ${activeStates.path ? 'text-indigo-400' : 'text-slate-600'}`} />} 
            label={activeStates.path && activeStates.surface ? `${activeStates.path} / ${activeStates.surface}` : 'Path / Surface ?'} 
          />
          <StatusBadge 
            icon={<HardHat className={`w-3 h-3 ${
              activeStates.helmet === 'Properly' ? 'text-green-400' : 
              activeStates.helmet === 'None' ? 'text-red-400' : 
              activeStates.helmet === 'Improperly' ? 'text-amber-400' : 'text-slate-600'
            }`} />} 
            label={activeStates.helmet || 'Helmet ?'} 
          />
        </div>
      </div>

      {/* --- SECONDARY MINI VIEW --- */}
      <div className="col-span-4 flex flex-col gap-4">
        <div className="h-[180px] bg-black rounded-2xl overflow-hidden border border-slate-800 relative shadow-xl">
          <video
            ref={miniFrontRef}
            src={frontUrl}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${!isSwapped ? 'opacity-0' : 'opacity-100'}`}
            muted
            playsInline
          />
          <video
            ref={miniBackRef}
            src={backUrl}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isSwapped ? 'opacity-0' : 'opacity-100'}`}
            muted
            playsInline
          />
          <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 rounded text-[8px] font-bold text-white uppercase border border-white/10 z-20">
            {isSwapped ? 'Front' : 'Rear'}
          </div>
        </div>
        
        {/* Map Slot for MapView */}
        <div className="flex-1 relative bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden" id="map-slot">
             {/* Map renders here via Portal or absolute positioning in App.tsx */}
        </div>
      </div>
    </div>
  );
});

const StatusBadge: React.FC<{ icon: React.ReactNode, label: string }> = ({ icon, label }) => (
  <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[9px] font-black uppercase flex items-center gap-2 text-slate-200">
    {icon} {label}
  </div>
);

export default VideoPlayer;