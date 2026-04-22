/* -------------------------------------------------------------------------- */
/* TRIPS Bike Annotation - Hook with Timestamped Filenames                   */
/* -------------------------------------------------------------------------- */

import { useState, useCallback } from 'react';
import { Annotation, GPSPoint, ProjectData } from '../types';

export const useAnnotationSync = (userId: string) => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  const formatTime = useCallback((seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  const deleteAnnotation = useCallback((id: string) => {
    setAnnotations((prev) => prev.filter((ann) => ann.id !== id));
  }, []);

  /**
   * Filename Generator
   * Format: [User]_[MM-DD-YYYY]_[HH-mm-ss]_[Suffix].ext
   */
  const getFormattedFileName = useCallback((suffix: string) => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const yyyy = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const id = userId.replace(/\s+/g, '-').toLowerCase() || 'anonymous';
    
    return `${id}_${mm}-${dd}-${yyyy}_${hh}-${min}-${ss}_${suffix}`;
  }, [userId]);

  const getCoordinatesAtTime = (time: number, gpsData: GPSPoint[]) => {
    if (!gpsData || gpsData.length === 0) return { lat: '', lng: '' };
    const closest = gpsData.reduce((prev, curr) => 
      Math.abs(curr.timestamp - time) < Math.abs(prev.timestamp - time) ? curr : prev
    );
    return { lat: closest.lat.toFixed(6), lng: closest.lng.toFixed(6) };
  };

  const parseNoteDetails = (note: string) => {
    const details: Record<string, string> = {};
    const contextMatch = note.match(/\[W:(.*?), P:(.*?), S:(.*?), H:(.*?)\]/);
    if (contextMatch) {
      details['Weather'] = contextMatch[1];
      details['Path'] = contextMatch[2];
      details['Surface'] = contextMatch[3];
      details['Helmet'] = contextMatch[4];
    }
    const dataPart = note.split('] ')[1] || "";
    if (note.includes('Behaviors:')) {
        details['Behaviors'] = dataPart.replace('Behaviors: ', '');
    } else {
        dataPart.split(' | ').forEach(seg => {
          const [key, val] = seg.split(':');
          if (key && val) details[key.trim()] = val.trim();
        });
    }
    return details;
  };

  const saveWithSystemDialog = async (content: string, fileName: string, fileType: 'csv' | 'trips') => {
    try {
      const pickerOpts = {
        suggestedName: fileName,
        types: [
          fileType === 'csv' 
            ? { description: 'CSV Data File', accept: { 'text/csv': ['.csv'] } }
            : { description: 'TRIPS Workspace File', accept: { 'application/json': ['.trips'] } }
        ],
      };

      const handle = await (window as any).showSaveFilePicker(pickerOpts);
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.warn("Save Picker failed, falling back to Downloads folder.");
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const exportToCSV = useCallback(async (gpsData: GPSPoint[]) => {
    const dynamicHeaders = [
      'Timestamp_Raw', 'Formatted_Time', 'Latitude', 'Longitude', 
      'Annotation_Type', 'Label', 'Weather', 'Path', 'Surface', 'Helmet',
      'ScanFront', 'ScanRear', 'HandSignal', 'StopBehavior', 'RiskyBehavior', 
      'JunctionControl', 'RiderControl', 'Situation', 'Behaviors', 'Raw_Note'
    ];

    const rows = annotations.map((ann) => {
      const coords = getCoordinatesAtTime(ann.timestamp, gpsData);
      const details = parseNoteDetails(ann.note);
      let displayType = ann.type as string;
      if (ann.value.startsWith('Critical Point')) displayType = 'Critical';

      return [
        ann.timestamp.toFixed(3), ann.formattedTime, coords.lat, coords.lng,
        displayType, ann.value, details['Weather'] || '', details['Path'] || '',
        details['Surface'] || '', details['Helmet'] || '',
        details['scanFront'] || details['hzFront'] || details['lcScanFront'] || '',
        details['scanRear'] || details['hzRear'] || details['lcScanRear'] || '',
        details['handSignal'] || details['hzHand'] || details['lcHandSignal'] || '',
        details['stopBehavior'] || details['hzStopYield'] || '',
        details['riskyBehavior'] || details['hzRisky'] || details['lcRisky'] || '',
        details['junctionControlType'] || '', details['riderControlType'] || '',
        details['situation'] || '', details['Behaviors'] || '',
        `"${ann.note.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [dynamicHeaders, ...rows].map((e) => e.join(',')).join('\n');
    const name = getFormattedFileName('annotations.csv');
    await saveWithSystemDialog(csvContent, name, 'csv');
  }, [annotations, getFormattedFileName]);

  /* UPDATED: Added fingerprint parameter to capture the session lock */
  const saveWorkspaceFile = useCallback(async (gpsData: GPSPoint[], fingerprint: string) => {
    const projectData: ProjectData = {
      version: '1.2',
      userId,
      fingerprint, // This saves the 'lock' into the JSON
      annotations,
      gpsData,
      exportDate: new Date().toISOString()
    };
    const jsonContent = JSON.stringify(projectData, null, 2);
    const name = getFormattedFileName('workspace.trips');
    
    await saveWithSystemDialog(jsonContent, name, 'trips');
  }, [annotations, userId, getFormattedFileName]);

  return {
    annotations, setAnnotations, formatTime, 
    deleteAnnotation, exportToCSV, saveWorkspaceFile 
  };
};