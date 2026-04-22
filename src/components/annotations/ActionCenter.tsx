/* -------------------------------------------------------------------------- */
/* TRIPS Bike Annotation - Action Center                                      */
/* -------------------------------------------------------------------------- */

import React, { useState } from 'react';
import { 
  AlertTriangle, Split, Plus, X, CornerDownRight, 
  Droplets, Map as MapIcon, HardHat 
} from 'lucide-react';
import { ActiveStates, AnnotationType } from '../../types';

interface ActionCenterProps {
  activeStates: ActiveStates;
  pendingAnnotation: any;
  pendingNote: string;
  setPendingNote: (note: string) => void;
  setPendingAnnotation: (ann: any) => void;
  onUpdateState: (key: keyof ActiveStates, value: string) => void;
  onActionClick: (type: AnnotationType, value: string, color: string) => void;
  onOpenCriticalPointPicker: () => void;
  onOpenRecklessModal: () => void;
  onSaveAnnotation: () => void;
}

const ActionCenter: React.FC<ActionCenterProps> = ({
  activeStates,
  pendingAnnotation,
  pendingNote,
  setPendingNote,
  setPendingAnnotation,
  onUpdateState,
  onActionClick,
  onOpenCriticalPointPicker,
  onOpenRecklessModal,
  onSaveAnnotation
}) => {
  return (
    <div className="h-32 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 shadow-2xl relative">
      {pendingAnnotation ? (
        /* --- PENDING ANNOTATION VIEW (Drafting) --- */
        <div className="flex-1 flex items-center gap-6 animate-in slide-in-from-bottom-2">
          <img 
            src={pendingAnnotation.screenshot} 
            className="w-16 h-16 rounded-lg object-cover border border-indigo-500/30" 
            alt="Pending" 
          />
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-bold uppercase w-fit px-2 py-0.5 rounded border ${
                pendingAnnotation.color === 'red' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                pendingAnnotation.color === 'purple' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                'bg-slate-500/10 text-slate-400 border-slate-500/20'
              }`}>
                {pendingAnnotation.type}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {pendingAnnotation.value}
              </span>
            </div>
            <input
              autoFocus
              type="text"
              placeholder="Detail the observation..."
              className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs w-full text-slate-200 outline-none focus:border-indigo-500 transition-colors"
              value={pendingNote}
              onChange={(e) => setPendingNote(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSaveAnnotation()}
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onSaveAnnotation} 
              className="px-5 py-2.5 bg-indigo-600 rounded-lg text-[10px] font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
            >
              Save
            </button>
            <button 
              onClick={() => setPendingAnnotation(null)} 
              className="p-2.5 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        /* --- DEFAULT IDLE VIEW (Selectors & Buttons) --- */
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-center gap-4 border-b border-slate-800 pb-2">
            <StateSelector 
              label="Weather" 
              icon={<Droplets className={`w-3 h-3 ${activeStates.weather ? 'text-blue-400' : 'text-slate-600'}`} />} 
              value={activeStates.weather}
              options={['Clear', 'Rain', 'Fog']}
              onChange={(v) => onUpdateState('weather', v)}
              colorClass="text-blue-400"
            />
            <StateSelector 
              label="Path" 
              icon={<MapIcon className={`w-3 h-3 ${activeStates.path ? 'text-indigo-400' : 'text-slate-600'}`} />} 
              value={activeStates.path}
              options={['Road', 'Bike Lane', 'Shoulder', 'Sidewalk', 'Parking']}
              onChange={(v) => onUpdateState('path', v)}
              colorClass="text-indigo-400"
            />
            <StateSelector 
              label="Surface" 
              value={activeStates.surface}
              options={['Paved', 'Dirt', 'Gravel', 'Grass']}
              onChange={(v) => onUpdateState('surface', v)}
              colorClass="text-amber-400"
            />
            <StateSelector 
              label="Helmet" 
              icon={<HardHat className={`w-3 h-3 ${activeStates.helmet ? 'text-green-400' : 'text-slate-600'}`} />} 
              value={activeStates.helmet}
              options={['Properly', 'Improperly', 'None']}
              onChange={(v) => onUpdateState('helmet', v)}
              colorClass="text-green-400"
            />
          </div>

          <div className="flex gap-3 justify-between items-center">
            <div className="flex gap-3">
              <QuickActionBtn
                onClick={onOpenRecklessModal}
                icon={<AlertTriangle className="w-4 h-4" />}
                color="red"
                label="Reckless"
              />
              <QuickActionBtn
                onClick={onOpenCriticalPointPicker}
                icon={<Split className="w-4 h-4" />}
                color="purple"
                label="Critical Point"
              />
              <QuickActionBtn
                onClick={() => onActionClick(AnnotationType.GENERAL, 'Manual Log', 'slate')}
                icon={<Plus className="w-4 h-4" />}
                color="slate"
                label="Log"
              />
            </div>

            <div className="text-slate-500 text-[10px] italic flex items-center gap-2 bg-black/20 p-2 rounded-xl border border-white/5">
              <CornerDownRight className="w-3 h-3 text-indigo-500" />
              Environment changes are automatically logged to the sidebar.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* --- Internal Helper Components --- */

const StateSelector: React.FC<{
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  icon?: React.ReactNode;
  colorClass: string;
}> = ({ label, value, options, onChange, icon, colorClass }) => {
  const [isOther, setIsOther] = useState(false);
  const [otherValue, setOtherValue] = useState('');

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'OTHER_TRIGGER') {
      setIsOther(true);
    } else {
      setIsOther(false);
      onChange(val);
    }
  };

  return (
    <div className="flex items-center gap-2 border-r border-slate-800 last:border-0 pr-4 h-6">
      {icon}
      <span className="text-[8px] font-black text-slate-500 uppercase">{label}:</span>
      
      {isOther ? (
        <div className="flex items-center gap-1 animate-in fade-in slide-in-from-left-1">
          <input 
            autoFocus
            type="text"
            className={`bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-[9px] font-bold outline-none focus:border-indigo-500 ${colorClass} w-20`}
            placeholder="Type..."
            value={otherValue}
            onChange={(e) => setOtherValue(e.target.value)}
            onBlur={() => otherValue && onChange(`Other: ${otherValue}`)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && otherValue) {
                onChange(`Other: ${otherValue}`);
                setIsOther(false);
              }
              if (e.key === 'Escape') setIsOther(false);
            }}
          />
          <button onClick={() => setIsOther(false)} className="text-slate-600 hover:text-white">
            <X size={10} />
          </button>
        </div>
      ) : (
        <select
          className={`bg-transparent text-[9px] font-bold outline-none cursor-pointer ${value ? colorClass : 'text-slate-500 italic'}`}
          value={value.startsWith('Other:') ? 'OTHER_TRIGGER' : value}
          onChange={handleSelectChange}
        >
          <option value="" disabled className="bg-slate-900 text-slate-500">Select...</option>
          {options.map(opt => (
            <option key={opt} value={opt} className="bg-slate-900 text-slate-200">{opt}</option>
          ))}
          <option value="OTHER_TRIGGER" className="bg-slate-900 text-indigo-400 font-bold">Other...</option>
        </select>
      )}
    </div>
  );
};

const QuickActionBtn: React.FC<{
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color: 'red' | 'purple' | 'slate';
}> = ({ onClick, icon, label, color }) => {
  const themes = {
    red: 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-400',
    purple: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20 text-purple-400',
    slate: 'bg-slate-700/50 hover:bg-slate-700 border-slate-600 text-slate-300'
  };

  return (
    <button 
      onClick={onClick} 
      className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all active:scale-95 ${themes[color]}`}
    >
      {icon}
      <span className="text-[8px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
};

export default ActionCenter;