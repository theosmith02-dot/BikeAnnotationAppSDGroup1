/* -------------------------------------------------------------------------- */
/* TRIPS Bike Annotation Software - Senior Design Group 1                     */
/* Team Members: Theo Smith (EE), Jack Eyrich   (CSE), Anthony Roti (EE)      */
/* Latest Revision: 4/13/2026   

/* App.tsx: Main Entry Point, Global State, Video Sync, and Layout Grid       */
/* -------------------------------------------------------------------------- */
/*Jack Git test*/
/*Theo approves*/


import React, { useState, useRef } from 'react';
import { Annotation, AnnotationType, GPSPoint, ActiveStates } from './types';

// Layout & UI
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';

// Feature Components
import VideoPlayer from './components/video/VideoPlayer';
import MapView from './components/map/MapView';
import ActionCenter from './components/annotations/ActionCenter';

// Modals
import SessionSetupModal from './components/setup/SessionSetupModal';
import CriticalPointPickerModal from './components/annotations/modals/CriticalPointPickerModal';
import JunctionModal from './components/annotations/modals/JunctionModal';
import LaneChangeModal from './components/annotations/modals/LaneChangeModal';
import RecklessModal from './components/annotations/modals/RecklessModal';
import HazardModal from './components/annotations/modals/HazardModal'; 

// Hooks
import { useAnnotationSync } from './hooks/useAnnotationSync';

const App: React.FC = () => {
  /* --- 1. SESSION & MEDIA STATE --- */
  const [userId, setUserId] = useState('');
  const [frontVideo, setFrontVideo] = useState<{ url: string } | null>(null);
  const [backVideo, setBackVideo] = useState<{ url: string } | null>(null);
  const [gpsData, setGpsData] = useState<GPSPoint[]>([]);

  /* --- 2. UI & PLAYBACK STATE --- */
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isSwapped, setIsSwapped] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAutoCentering, setIsAutoCentering] = useState(true);

  /* --- 3. MODAL & WORKFLOW STATE --- */
  const [showSetup, setShowSetup] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [activeModal, setActiveModal] = useState<'junction' | 'lane' | 'reckless' | 'hazard' | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  /* --- 4. ANNOTATION STATE --- */
  const { 
    annotations, setAnnotations, formatTime, 
    deleteAnnotation, exportToCSV, saveWorkspaceFile 
  } = useAnnotationSync(userId);

  const [pendingAnnotation, setPendingAnnotation] = useState<any>(null);
  const [pendingNote, setPendingNote] = useState('');
  const [activeStates, setActiveStates] = useState<ActiveStates>({
    weather: '', path: '', surface: '', helmet: ''
  });

  const videoPlayerRef = useRef<any>(null);

  /* -------------------------------------------------------------------------- */
  /* HANDLERS                                                                   */
  /* -------------------------------------------------------------------------- */

  const captureFrame = () => {
    const video = videoPlayerRef.current?.getRef();
    if (!video) return null;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    return { screenshot: canvas.toDataURL('image/jpeg'), timestamp: video.currentTime };
  };

  const handleUpdateState = (key: keyof ActiveStates, value: string) => {
    const oldVal = activeStates[key];
    if (oldVal === value) return;
    setActiveStates(prev => ({ ...prev, [key]: value }));
    
    const log: Annotation = {
      id: crypto.randomUUID(),
      timestamp: currentTime,
      formattedTime: formatTime(currentTime),
      type: AnnotationType.GENERAL,
      value: 'State Change',
      note: `SYSTEM: ${key.toUpperCase()} set to "${value}" (Was: ${oldVal || "None"})`,
      screenshot: '',
      color: 'slate'
    };
    setAnnotations(prev => [...prev, log].sort((a, b) => a.timestamp - b.timestamp));
  };

  const saveComplexModalData = (label: string, type: AnnotationType, data: any, color: string) => {
    const context = `[W:${activeStates.weather || '?'}, P:${activeStates.path || '?'}, S:${activeStates.surface || '?'}, H:${activeStates.helmet || '?'}]`;
    
    let detailString = "";
    if (type === AnnotationType.RECKLESS) {
      const list = data.behaviors.map((b: string) => data.details[b] ? `${b}(${data.details[b]})` : b).join(', ');
      detailString = `Behaviors: ${list}`;
    } else {
      detailString = Object.entries(data)
        .filter(([_, v]) => v !== '' && v !== 'N/R')
        .map(([k, v]) => `${k}:${Array.isArray(v) ? v.join('/') : v}`)
        .join(' | ');
    }

    if (isEditing && editingId) {
      setAnnotations(prev => prev.map(ann => 
        ann.id === editingId ? { ...ann, note: `${context} ${detailString}` } : ann
      ));
    } else {
      const frame = captureFrame();
      if (!frame) return;
      const newAnn: Annotation = {
        id: crypto.randomUUID(),
        timestamp: frame.timestamp,
        formattedTime: formatTime(frame.timestamp),
        type: type,
        value: label,
        note: `${context} ${detailString}`,
        screenshot: frame.screenshot,
        color: color
      };
      setAnnotations(prev => [...prev, newAnn].sort((a, b) => a.timestamp - b.timestamp));
    }
    closeModals();
  };

  const handleEdit = (ann: Annotation) => {
    setIsPlaying(false);
    setEditingId(ann.id);
    setIsEditing(true);
    if (ann.value.includes('Junction')) setActiveModal('junction');
    else if (ann.value.includes('Lane')) setActiveModal('lane');
    else if (ann.value.includes('Hazard')) setActiveModal('hazard');
    else if (ann.value === 'Reckless Behavior') setActiveModal('reckless');
  };

  const closeModals = () => {
    setActiveModal(null);
    setShowPicker(false);
    setIsEditing(false);
    setEditingId(null);
  };

  const parseDefaults = (id: string) => {
    const ann = annotations.find(a => a.id === id);
    if (!ann) return {};
    const defaults: any = { behaviors: [], details: {} };
    const content = ann.note.split('] ')[1] || "";
    
    if (ann.type === AnnotationType.RECKLESS) {
      const listPart = content.replace('Behaviors: ', '');
      listPart.split(', ').forEach(item => {
        if (item.includes('(')) {
          const [name, detail] = item.split(/[()]/);
          defaults.behaviors.push(name);
          defaults.details[name] = detail;
        } else {
          defaults.behaviors.push(item);
        }
      });
    } else {
      content.split(' | ').forEach(p => {
        const [k, v] = p.split(':');
        if (k) defaults[k] = v;
      });
    }
    return defaults;
  };

  const handleStartSession = (
    front: File | null, 
    back: File | null, 
    gps: GPSPoint[], 
    imported?: Annotation[], 
    id?: string
  ) => {
    if (id) setUserId(id);
    if (front instanceof File) setFrontVideo({ url: URL.createObjectURL(front) });
    if (back instanceof File) setBackVideo({ url: URL.createObjectURL(back) });
    setGpsData(gps);
    
    if (imported && imported.length > 0) {
      setAnnotations([...imported].sort((a, b) => a.timestamp - b.timestamp));
    } else {
      setAnnotations([]);
    }
    
    setShowSetup(false);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  if (showSetup) return <SessionSetupModal onStart={handleStartSession} onClose={() => setShowSetup(false)} isResuming={frontVideo !== null} />;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {sidebarOpen && (
        <Sidebar 
          annotations={annotations} 
          onSeekToTime={(t) => { videoPlayerRef.current?.syncAll(t); setCurrentTime(t); }} 
          onDeleteAnnotation={deleteAnnotation} 
          onEditAnnotation={handleEdit}
          onClose={() => setSidebarOpen(false)} 
        />
      )}

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <Header 
          userId={userId} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}
          onSaveWorkspace={() => saveWorkspaceFile(gpsData)} onNewSession={() => setShowSetup(true)}
          onExportCSV={() => exportToCSV(gpsData)} isSwapped={isSwapped} setIsSwapped={setIsSwapped}
          isMuted={isMuted} setIsMuted={setIsMuted} currentTime={currentTime} formatTime={formatTime}
          playbackRate={playbackRate} onPlaybackRateChange={setPlaybackRate}
        />

        <div className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
          <VideoPlayer 
            ref={videoPlayerRef} frontUrl={frontVideo?.url} backUrl={backVideo?.url}
            currentTime={currentTime} duration={duration} isPlaying={isPlaying}
            isMuted={isMuted} isSwapped={isSwapped} playbackRate={playbackRate} activeStates={activeStates}
            onTimeUpdate={setCurrentTime} onDurationChange={setDuration}
            onTogglePlay={() => setIsPlaying(!isPlaying)} onSeek={(t) => { videoPlayerRef.current?.syncAll(t); setCurrentTime(t); }}
          />

          <ActionCenter 
            activeStates={activeStates} pendingAnnotation={pendingAnnotation} pendingNote={pendingNote}
            setPendingNote={setPendingNote} setPendingAnnotation={setPendingAnnotation}
            onUpdateState={handleUpdateState} 
            onActionClick={(type, val, col) => { setIsPlaying(false); const frame = captureFrame(); if(frame) setPendingAnnotation({...frame, type, value: val, color: col}); }} 
            onOpenCriticalPointPicker={() => { setIsPlaying(false); setShowPicker(true); }}
            onOpenRecklessModal={() => { setIsPlaying(false); setActiveModal('reckless'); }}
            onSaveAnnotation={() => {
              const context = `[W:${activeStates.weather || '?'}, P:${activeStates.path || '?'}, S:${activeStates.surface || '?'}, H:${activeStates.helmet || '?'}]`;
              const newAnn = { id: crypto.randomUUID(), timestamp: pendingAnnotation.timestamp, formattedTime: formatTime(pendingAnnotation.timestamp), type: pendingAnnotation.type, value: pendingAnnotation.value, note: pendingNote ? `${context} ${pendingNote}` : context, screenshot: pendingAnnotation.screenshot, color: pendingAnnotation.color };
              setAnnotations(prev => [...prev, newAnn].sort((a,b) => a.timestamp - b.timestamp));
              setPendingAnnotation(null); setPendingNote('');
            }}
          />
        </div>
        
        <div className="absolute top-[285px] right-8 w-[calc(33.33%-3rem)] h-[calc(100%-460px)] z-30">
          <MapView gpsData={gpsData} currentTime={currentTime} isAutoCentering={isAutoCentering} setIsAutoCentering={setIsAutoCentering} />
        </div>
      </div>

      {showPicker && (
        <CriticalPointPickerModal 
          onClose={closeModals} 
          onSelect={(v) => {
            setShowPicker(false);
            if (v === 'Junctions') setActiveModal('junction');
            if (v === 'Change Lanes') setActiveModal('lane');
            if (v === 'Hazard Anticipation') setActiveModal('hazard');
          }} 
        />
      )}

      {activeModal === 'junction' && <JunctionModal onClose={closeModals} onSave={(d) => saveComplexModalData('Critical Point - Junction', AnnotationType.GENERAL, d, 'purple')} defaults={isEditing ? parseDefaults(editingId!) : {}} isEditing={isEditing} />}
      {activeModal === 'lane' && <LaneChangeModal onClose={closeModals} onSave={(d) => saveComplexModalData('Critical Point - Lane Change', AnnotationType.GENERAL, d, 'purple')} defaults={isEditing ? parseDefaults(editingId!) : {}} isEditing={isEditing} />}
      {activeModal === 'reckless' && <RecklessModal onClose={closeModals} onSave={(d) => saveComplexModalData('Reckless Behavior', AnnotationType.RECKLESS, d, 'red')} defaults={isEditing ? parseDefaults(editingId!) : {}} isEditing={isEditing} />}
      {activeModal === 'hazard' && <HazardModal onClose={closeModals} onSave={(d) => saveComplexModalData('Critical Point - Hazard', AnnotationType.GENERAL, d, 'purple')} defaults={isEditing ? parseDefaults(editingId!) : {}} isEditing={isEditing} />}
    </div>
  );
};

export default App;