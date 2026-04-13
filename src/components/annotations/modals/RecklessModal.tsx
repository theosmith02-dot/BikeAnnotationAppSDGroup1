/* -------------------------------------------------------------------------- */
/* TRIPS Bike Annotation - Special: Reckless Behavior Modal                   */
/* -------------------------------------------------------------------------- */

import React, { useState } from 'react';
import { ModalShell } from '../../ui/ModalElements';

interface RecklessProps {
  onClose: () => void;
  onSave: (data: Record<string, any>) => void;
  defaults?: Record<string, any>;
  isEditing?: boolean;
}

const RecklessModal: React.FC<RecklessProps> = ({ 
  onClose, 
  onSave, 
  defaults = {}, 
  isEditing = false 
}) => {
  // Logic to handle both fresh states and editing states
  const [behaviors, setBehaviors] = useState<string[]>(defaults.behaviors || []);
  const [details, setDetails] = useState<Record<string, string>>(defaults.details || {});

  const options = [
    'Distracted', 
    'Unpredictable Riding', 
    'Inappropriate Speed', 
    'Holding something with one hand', 
    'Something (bags) draped on handlebar',
    'No hands on handlebar', 
    'Risky Positioning (duration)', 
    'Riding Against Traffic', 
    'Lack of bike control', 
    'Inappropriate riding zone', 
    'Others'
  ];

  const toggleBehavior = (val: string) => {
    setBehaviors(prev => 
      prev.includes(val) ? prev.filter(b => b !== val) : [...prev, val]
    );
  };

  const updateDetail = (key: string, val: string) => {
    setDetails(prev => ({ ...prev, [key]: val }));
  };

  const handleConfirm = () => {
    // We pass the raw data back to App.tsx to be formatted into the note string
    onSave({ behaviors, details });
  };

  return (
    <ModalShell 
      title={isEditing ? "Edit Special - Reckless Behavior" : "Special - Reckless Behavior"} 
      onClose={onClose}
    >
      <div className="space-y-6">
        {/* Header Label */}
        <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2">
          Reckless behavior / Lack of skills (Check all applicable)
        </div>
        
        {/* Checkbox Grid */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-5 py-2">
          {options.map(opt => (
            <div key={opt} className="flex flex-col gap-1.5">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={behaviors.includes(opt)}
                  onChange={() => toggleBehavior(opt)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all"
                />
                <span className={`text-xs transition-colors ${
                  behaviors.includes(opt) ? 'font-bold text-slate-900' : 'text-slate-600 group-hover:text-slate-900'
                }`}>
                  {opt}
                </span>
              </label>
              
              {/* Conditional Detail Inputs */}
              {(opt === 'Distracted' || opt === 'Lack of bike control' || opt === 'Others') && behaviors.includes(opt) && (
                <input 
                  autoFocus={opt === 'Others'}
                  type="text"
                  placeholder={`Describe ${opt.toLowerCase()}...`}
                  value={details[opt] || ''}
                  onChange={(e) => updateDetail(opt, e.target.value)}
                  className="ml-7 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-[11px] outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                />
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
          <button 
            onClick={onClose} 
            className="px-5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm} 
            disabled={behaviors.length === 0}
            className="px-10 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20 transition-all active:scale-95"
          >
            {isEditing ? 'Save Changes' : 'Ok'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default RecklessModal;