/* -------------------------------------------------------------------------- */
/* TRIPS Bike Annotation - Lane Change Modal                                  */
/* -------------------------------------------------------------------------- */

import React, { useState } from 'react';
import { ModalShell, FieldBlock, FormRadio } from '../../ui/ModalElements';

interface LaneChangeModalProps {
  onClose: () => void;
  onSave: (data: Record<string, any>) => void;
  defaults?: Record<string, any>;
  isEditing?: boolean;
}

const LaneChangeModal: React.FC<LaneChangeModalProps> = ({ 
  onClose, 
  onSave, 
  defaults = {}, 
  isEditing = false 
}) => {
  // State initialization with defaults to support Edit Mode
  const [situation, setSituation] = useState(defaults.situation || 'Simple lane/path change');
  const [scanFront, setScanFront] = useState(defaults.scanFront || 'Partial');
  const [scanRear, setScanRear] = useState(defaults.scanRear || 'No');
  const [handSignal, setHandSignal] = useState(defaults.handSignal || 'No');
  const [midblock, setMidblock] = useState(defaults.midblock || 'No');
  const [riskyBehavior, setRiskyBehavior] = useState(defaults.riskyBehavior || 'No');
  const [riskyExplain, setRiskyExplain] = useState(defaults.riskyExplain || '');
  const [ridingSurfacePath, setRidingSurfacePath] = useState(defaults.ridingSurfacePath || 'Changed');

  const handleOk = () => {
    onSave({ 
      situation, 
      scanFront, 
      scanRear, 
      handSignal, 
      midblock, 
      riskyBehavior, 
      riskyExplain, 
      ridingSurfacePath 
    });
  };

  return (
    <ModalShell 
      title={isEditing ? 'Edit — Conflict Points: Change Lanes' : 'Conflict Points - Change Lanes'} 
      onClose={onClose}
    >
      {isEditing && (
        <div className="mb-4 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-[11px] text-indigo-700 font-medium">
          Editing existing annotation — timestamp and screenshot will be preserved.
        </div>
      )}

      <div className="grid grid-cols-5 gap-3">
        {/* Situation Block */}
        <FieldBlock title="Situation">
          <FormRadio 
            name="situation" 
            value="Simple lane/path change" 
            checked={situation === 'Simple lane/path change'} 
            onChange={setSituation} 
            label="Simple lane/path change" 
          />
        </FieldBlock>

        <div className="col-span-4 space-y-3">
          {/* Comprehensive Behavior Section */}
          <FieldBlock title="Behavior">
            <div className="grid grid-cols-1 gap-3">
              <FieldBlock title="Scan Traffic (Front)" pink>
                <div className="flex flex-wrap gap-x-8 gap-y-2">
                  {['Yes', 'Partial', 'No', 'N/R', 'N/O'].map((v) => (
                    <FormRadio key={v} name="lcScanFront" value={v} checked={scanFront === v} onChange={setScanFront} label={v} />
                  ))}
                </div>
              </FieldBlock>

              <FieldBlock title="Scan Traffic (Rear)" pink>
                <div className="flex flex-wrap gap-x-8 gap-y-2">
                  {['Yes', 'No', 'N/O', 'N/R'].map((v) => (
                    <FormRadio key={v} name="lcScanRear" value={v} checked={scanRear === v} onChange={setScanRear} label={v} />
                  ))}
                </div>
              </FieldBlock>

              <FieldBlock title="Hand Signal" pink>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {['Correct Turn', 'Alternative Turn', 'Correct Stop', 'Other Incorrect', 'No', 'N/R', 'N/O'].map((v) => (
                    <FormRadio key={v} name="lcHandSignal" value={v} checked={handSignal === v} onChange={setHandSignal} label={v} />
                  ))}
                </div>
              </FieldBlock>

              <FieldBlock title="Midblock" pink>
                <div className="flex flex-wrap gap-x-8 gap-y-2">
                  {['Midblock dart out', 'Midblock cross', 'No'].map((v) => (
                    <FormRadio key={v} name="lcMidblock" value={v} checked={midblock === v} onChange={setMidblock} label={v} />
                  ))}
                </div>
              </FieldBlock>

              <div className="grid grid-cols-2 gap-4">
                <FieldBlock title="Risky Behavior" pink>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-6">
                      {['Yes', 'No'].map((v) => (
                        <FormRadio key={v} name="lcRisky" value={v} checked={riskyBehavior === v} onChange={setRiskyBehavior} label={v} />
                      ))}
                    </div>
                    {riskyBehavior === 'Yes' && (
                      <input 
                        value={riskyExplain} 
                        onChange={(e) => setRiskyExplain(e.target.value)} 
                        className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500" 
                        placeholder="Explain behavior..." 
                      />
                    )}
                  </div>
                </FieldBlock>

                <FieldBlock title="Riding Surface/Path" pink>
                  <div className="flex gap-8">
                    {['Changed', 'Not Changed'].map((v) => (
                      <FormRadio 
                        key={v} 
                        name="lcRidingSurfacePath" 
                        value={v} 
                        checked={ridingSurfacePath === v} 
                        onChange={setRidingSurfacePath} 
                        label={v} 
                      />
                    ))}
                  </div>
                </FieldBlock>
              </div>
            </div>
          </FieldBlock>

          <div className="flex justify-end gap-3 pt-4">
            <button 
              onClick={onClose} 
              className="px-5 py-2 rounded-lg border border-slate-300 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleOk} 
              className="px-8 py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 shadow-md transition-all active:scale-95"
            >
              {isEditing ? 'Save Changes' : 'Ok'}
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
};

export default LaneChangeModal;