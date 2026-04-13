/* -------------------------------------------------------------------------- */
/* TRIPS Bike Annotation - Sidebar & Observation List                         */
/* -------------------------------------------------------------------------- */

import React from 'react';
import { History, X, Trash2, Pencil } from 'lucide-react';
import { Annotation } from '../../types';

interface SidebarProps {
  annotations: Annotation[];
  onSeekToTime: (time: number) => void;
  onDeleteAnnotation: (id: string) => void;
  onEditAnnotation: (ann: Annotation) => void; // New Edit Handler
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  annotations, 
  onSeekToTime, 
  onDeleteAnnotation, 
  onEditAnnotation,
  onClose 
}) => {
  
  // Helper to map color strings to Tailwind classes based on the 2026 revision
  const getColorStyles = (color: string = 'slate') => {
    const styles: Record<string, string> = {
      red: 'border-l-red-500 border-y-slate-800 border-r-slate-800 bg-red-500/10 text-red-400',
      amber: 'border-l-amber-500 border-y-slate-800 border-r-slate-800 bg-amber-500/10 text-amber-400',
      blue: 'border-l-blue-500 border-y-slate-800 border-r-slate-800 bg-blue-500/10 text-blue-400',
      green: 'border-l-green-500 border-y-slate-800 border-r-slate-800 bg-green-500/10 text-green-400',
      purple: 'border-l-purple-500 border-y-slate-800 border-r-slate-800 bg-purple-500/10 text-purple-400',
      slate: 'border-l-slate-500 border-y-slate-800 border-r-slate-800 bg-slate-500/10 text-slate-400'
    };
    return styles[color] || styles.slate;
  };

  // Determine if an annotation is a Critical Point (and thus editable)
  const isEditable = (value: string) => value.startsWith('Critical Point');

  return (
    <div className="w-72 border-r border-slate-800 bg-slate-900/50 flex flex-col backdrop-blur-xl shrink-0 h-full">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
        <h2 className="text-sm font-bold flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-400" /> Observations
        </h2>
        <button 
          onClick={onClose} 
          className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Annotation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide">
        {annotations.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs uppercase tracking-widest font-bold">
            Empty
          </div>
        ) : (
          annotations.map((ann) => (
            <div
              key={ann.id}
              onClick={() => onSeekToTime(ann.timestamp)}
              className={`group cursor-pointer p-3 bg-slate-900 rounded-xl relative transition-all hover:bg-slate-800/40 border-l-4 ${
                ann.value === 'State Change' 
                  ? 'bg-indigo-500/5 border-l-slate-400 opacity-80 border-y border-r border-slate-800' 
                  : getColorStyles(ann.color)
              }`}
            >
              {/* Action Buttons Container */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Edit Button - Only for Critical Points */}
                {isEditable(ann.value) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditAnnotation(ann);
                    }}
                    className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500 hover:text-white transition-colors"
                    title="Edit Details"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                )}
                
                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteAnnotation(ann.id);
                  }}
                  className="p-1.5 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {/* Meta Info */}
              <div className="flex justify-between items-start mb-1 pr-14">
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase leading-none bg-black/30`}>
                  {ann.type}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {ann.formattedTime}
                </span>
              </div>

              {/* Content */}
              <h3 className="font-semibold text-xs mb-1 line-clamp-1 text-slate-200">
                {ann.value}
              </h3>
              
              {ann.note && (
                <p className="text-[10px] text-slate-400 line-clamp-3 mt-1 leading-relaxed italic">
                  {ann.note}
                </p>
              )}

              {/* Screenshot Preview */}
              {ann.screenshot && (
                <img 
                  src={ann.screenshot} 
                  className="w-full h-20 object-cover rounded-lg mt-2 border border-slate-800 shadow-inner group-hover:border-slate-600 transition-colors" 
                  alt="Observation" 
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;