/* -------------------------------------------------------------------------- */
/* TRIPS Annotation Software - Type Definitions                               */
/* -------------------------------------------------------------------------- */

export enum AnnotationType {
  CRASH = 'CRASH',
  GENERAL = 'GENERAL',
  WEATHER = 'WEATHER',
  SURFACE = 'SURFACE',
  HELMET = 'HELMET',
  RECKLESS = 'RECKLESS'
}

export interface GPSPoint {
  lat: number;
  lng: number;
  timestamp: number; 
}

export interface Annotation {
  id: string;
  timestamp: number;
  formattedTime: string;
  type: AnnotationType;
  value: string;
  note: string;
  screenshot: string;
  color?: string; 
}

export interface ActiveStates {
  weather: string;
  path: string;
  surface: string;
  helmet: string;
}

export interface ProjectData {
  version: string;
  userId: string;
  fingerprint: string; // Added: Unique ID matching the specific media files
  annotations: Annotation[];
  gpsData: GPSPoint[];
  exportDate: string;
}