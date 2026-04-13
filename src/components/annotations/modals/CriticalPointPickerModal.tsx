/* -------------------------------------------------------------------------- */
/* TRIPS Bike Annotation - Critical Point Selector                            */
/* -------------------------------------------------------------------------- */

import React, { useState } from 'react';
import { ModalShell } from '../../ui/ModalElements';

interface PickerProps {
  onClose: () => void;
  onSelect: (value: string) => void;
}

const CriticalPointPickerModal: React.FC<PickerProps> = ({ onClose, onSelect }) => {
  const [selection, setSelection] = useState('Junctions');

  const options = [
    {
      value: 'Junctions',
      description: 'Intersections, driveways, and controlled or uncontrolled crossing points.'
    },
    {
      value: 'Change Lanes',
      description: 'Lane shifts, path changes, merges, and midblock movement events.'
    },
    {
      value: 'Hazard Anticipation',
      description: 'Passing, yielding, avoiding, or reacting to people, vehicles, or obstacles.'
    }
  ];

  return (
    <ModalShell title="Critical Point Selection" onClose={onClose}>
      <div className="space-y-6">
        <div className="text-sm text-slate-700 font-medium">
          Choose the critical point type for this timestamp.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {options.map((option) => {
            const active = selection === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelection(option.value)}
                className={`text-left rounded-xl border p-5 transition-all outline-none ${
                  active
                    ? 'border-indigo-600 bg-indigo-50 shadow-md ring-2 ring-indigo-200'
                    : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className={`font-bold text-sm ${active ? 'text-indigo-700' : 'text-slate-900'}`}>
                      {option.value}
                    </div>
                    <div className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {option.description}
                    </div>
                  </div>

                  <div
                    className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                      active ? 'border-indigo-600' : 'border-slate-400'
                    }`}
                  >
                    {active && <div className="h-2 w-2 rounded-full bg-indigo-600" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button 
            onClick={onClose} 
            className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSelect(selection)} 
            className="px-8 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
          >
            Continue
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default CriticalPointPickerModal;