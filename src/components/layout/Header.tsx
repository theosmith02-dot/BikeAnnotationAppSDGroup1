/* -------------------------------------------------------------------------- */
/* TRIPS Bike Annotation - Header & Playback Controls                         */
/* -------------------------------------------------------------------------- */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, Save, RefreshCcw, Download, 
  ArrowLeftRight, Volume2, VolumeX, History,
  ChevronDown, Menu
} from 'lucide-react';

interface HeaderProps {
  userId: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onSaveWorkspace: () => void;
  onNewSession: () => void;
  onExportCSV: () => void;
  isSwapped: boolean;
  setIsSwapped: (swapped: boolean) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  currentTime: number;
  formatTime: (seconds: number) => string;
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
}

const Header: React.FC<HeaderProps> = ({
  userId,
  sidebarOpen,
  setSidebarOpen,
  onSaveWorkspace,
  onNewSession,
  onExportCSV,
  isSwapped,
  setIsSwapped,
  isMuted,
  setIsMuted,
  currentTime,
  formatTime,
  playbackRate,
  onPlaybackRateChange
}) => {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Close dashboard when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dashboardRef.current && !dashboardRef.current.contains(event.target as Node)) {
        setShowDashboard(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-6 z-50">
      {/* Brand / Logo Section */}
      <div className="flex items-center gap-2 font-bold uppercase tracking-tight text-sm">
        {!sidebarOpen && (
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="mr-2 p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400"
            title="Open Observations"
          >
            <History className="w-4 h-4" />
          </button>
        )}
        <Shield className="w-4 h-4 text-indigo-500" /> 
        <span className="hidden sm:inline text-slate-200">TRIPS Bike Annotation</span>
      </div>

      {/* Action Buttons Section */}
      <div className="flex items-center gap-3">
        
        {/* 3-Line Dashboard Menu */}
        <div className="relative" ref={dashboardRef}>
          <button 
            onClick={() => setShowDashboard(!showDashboard)}
            className={`p-2 rounded-lg border transition-all ${
              showDashboard 
                ? 'bg-indigo-600 border-indigo-500 text-white' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
            title="Session Dashboard"
          >
            <Menu className="w-4 h-4" />
          </button>

          {showDashboard && (
            <div className="absolute top-full left-0 mt-2 flex flex-col bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl min-w-[160px] z-[60]">
              <div className="px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-800 bg-slate-950">
                Session Controls
              </div>
              <button 
                onClick={() => { onSaveWorkspace(); setShowDashboard(false); }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-slate-300 transition-colors text-[10px] font-bold"
              >
                <Save className="w-3.5 h-3.5 text-green-500" />
                <span>Save .trips</span>
              </button>
              <button 
                onClick={() => { onExportCSV(); setShowDashboard(false); }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-slate-300 transition-colors text-[10px] font-bold"
              >
                <Download className="w-3.5 h-3.5 text-indigo-500" />
                <span>Export CSV</span>
              </button>
              <div className="h-px bg-slate-800" />
              <button 
                onClick={() => { onNewSession(); setShowDashboard(false); }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-red-950/30 text-red-400 transition-colors text-[10px] font-bold"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                <span>New Session</span>
              </button>
            </div>
          )}
        </div>

        <HeaderButton 
          onClick={() => setIsSwapped(!isSwapped)} 
          icon={<ArrowLeftRight className="w-3 h-3" />} 
          label="Swap View" 
          variant="outline" 
        />

        {/* Speed Selector */}
        <div className="relative">
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-lg text-[10px] font-bold transition-all ${
              showSpeedMenu 
                ? 'bg-indigo-600 border-indigo-500 text-white' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <span>{playbackRate === 1 ? '1×' : `${playbackRate}×`}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showSpeedMenu ? 'rotate-180' : ''}`} />
          </button>

          {showSpeedMenu && (
            <div className="absolute top-full right-0 mt-2 flex flex-col bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl min-w-[110px] z-[60]">
              <div className="px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-800 bg-slate-950">
                Playback Speed
              </div>
              {[0.5, 0.75, 1, 1.5, 2].map((rate) => (
                <button
                  key={rate}
                  onClick={() => {
                    onPlaybackRateChange(rate);
                    setShowSpeedMenu(false);
                  }}
                  className={`px-3 py-2 text-left text-[10px] font-semibold transition-colors flex items-center justify-between ${
                    playbackRate === rate
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>{rate === 1 ? '1× (Normal)' : `${rate}×`}</span>
                  {playbackRate === rate && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Audio & Time Display */}
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 ml-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-1 rounded transition-colors ${isMuted ? 'text-slate-500' : 'text-indigo-400'}`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <div className="font-mono text-indigo-400 font-bold text-xs min-w-[45px] text-center">
            {formatTime(currentTime)}
          </div>
        </div>
      </div>
    </header>
  );
};

/* --- Internal Button Component --- */

interface HeaderButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  variant: 'green' | 'indigo' | 'slate' | 'outline';
}

const HeaderButton: React.FC<HeaderButtonProps> = ({ onClick, icon, label, variant }) => {
  const styles = {
    green: "bg-green-600/20 text-green-400 border-green-500/30 hover:bg-green-600 hover:text-white",
    indigo: "bg-indigo-600/20 text-indigo-400 border-indigo-500/30 hover:bg-indigo-600 hover:text-white",
    slate: "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700",
    outline: "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-2.5 py-1 border rounded-lg text-[10px] font-bold transition-all ${styles[variant]}`}
    >
      {icon}
      <span className="hidden lg:inline">{label}</span>
    </button>
  );
};

export default Header;