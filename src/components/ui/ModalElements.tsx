/* -------------------------------------------------------------------------- */
/* TRIPS Bike Annotation - Shared UI Building Blocks                          */
/* -------------------------------------------------------------------------- */

import React from 'react';
import { X } from 'lucide-react';

/**
 * 1. MODAL SHELL
 * The primary wrapper for dialogs. Includes a scale transform to ensure
 * larger modals (like Junction) fit on standard laptop screens.
 */
export const ModalShell: React.FC<{ 
  title: string; 
  children: React.ReactNode; 
  onClose: () => void 
}> = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-slate-100 text-slate-900 w-full max-w-5xl rounded-xl shadow-2xl border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <h2 className="font-bold text-sm tracking-tight text-slate-800">{title}</h2>
        <button 
          onClick={onClose} 
          className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors text-slate-400 hover:text-slate-900"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 max-h-[85vh] overflow-y-auto">
        {children}
      </div>
    </div>
  </div>
);

/**
 * 2. FIELD BLOCK
 * Groups related inputs. The 'pink' prop triggers the rose-colored highlight 
 * used specifically for behavioral data points in the annotation guidelines.
 */
export const FieldBlock: React.FC<{ 
  title: string; 
  children: React.ReactNode; 
  pink?: boolean 
}> = ({ title, children, pink = false }) => (
  <div className={`border rounded-lg overflow-hidden transition-colors ${
    pink ? 'bg-rose-50/50 border-rose-200' : 'bg-white border-slate-200'
  }`}>
    <div className={`px-3 py-1.5 font-black text-[10px] border-b uppercase tracking-widest ${
      pink ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-500 border-slate-200'
    }`}>
      {title}
    </div>
    <div className="p-3 space-y-1.5">
      {children}
    </div>
  </div>
);

/**
 * 3. FORM RADIO
 * A consistent radio button component. Highlights the label text 
 * in indigo when selected to provide clear visual feedback.
 */
export const FormRadio: React.FC<{ 
  name: string; 
  value: string; 
  checked: boolean; 
  onChange: (v: string) => void; 
  label: string 
}> = ({ name, value, checked, onChange, label }) => (
  <label className="flex items-center gap-2.5 text-[12px] cursor-pointer group py-0.5">
    <div className="relative flex items-center justify-center">
      <input 
        type="radio" 
        name={name} 
        checked={checked} 
        onChange={() => onChange(value)}
        className="peer appearance-none w-4 h-4 border-2 border-slate-300 rounded-full checked:border-indigo-600 transition-all cursor-pointer"
      />
      <div className="absolute w-2 h-2 rounded-full bg-indigo-600 scale-0 peer-checked:scale-100 transition-transform" />
    </div>
    <span className={`transition-colors leading-tight select-none ${
      checked ? 'font-bold text-indigo-700' : 'text-slate-600 group-hover:text-slate-900'
    }`}>
      {label}
    </span>
  </label>
);