/* -------------------------------------------------------------------------- */
/* TRIPS Bike Annotation - Hazard Anticipation Modal (Critical Point)         */
/* -------------------------------------------------------------------------- */

import React, { useState } from 'react';
import { ModalShell, FieldBlock, FormRadio } from '../../ui/ModalElements';

interface HazardProps {
  onClose: () => void;
  onSave: (data: Record<string, any>) => void;
  defaults?: Record<string, any>;
  isEditing?: boolean;
}

const HazardModal: React.FC<HazardProps> = ({ 
  onClose, 
  onSave, 
  defaults = {}, 
  isEditing = false 
}) => {
  // State initialization matching the TRIPS research criteria
  const [hzFront, setHzFront] = useState(defaults.hzFront || '');
  const [hzRear, setHzRear] = useState(defaults.hzRear || '');
  const [hzHand, setHzHand] = useState(defaults.hzHand || '');
  const [hazardType, setHazardType] = useState(defaults.hazardType || '');
  const [action, setAction] = useState(defaults.action || '');

  const handleSave = () => {
    onSave({ 
      hzFront, 
      hzRear, 
      hzHand, 
      hazardType, 
      action 
    });
  };

  const binaryOptions = ['Yes', 'No', 'N/R'];
  const hazardOptions = ['Pedestrian', 'Vehicle', 'Cyclist', 'Object', 'Surface Condition'];
  const actionOptions = ['Braked', 'Swerved', 'Stopped', 'No Action', 'Other'];

  return (
    <ModalShell 
      title={isEditing ? "Edit Hazard Anticipation" : "Hazard Anticipation Selection"} 
      onClose={onClose}
    >
      <div className="space-y-6">
        
        {/* Row 1: Scanning Behaviors */}
        <div className="grid grid-cols-3 gap-6">
          <FieldBlock title="Scan Front">
            <div className="flex flex-col gap-1">
              {binaryOptions.map(opt => (
                <FormRadio 
                  key={opt} name="hzFront" label={opt} value={opt} 
                  checked={hzFront === opt} onChange={setHzFront} 
                />
              ))}
            </div>
          </FieldBlock>

          <FieldBlock title="Scan Rear">
            <div className="flex flex-col gap-1">
              {binaryOptions.map(opt => (
                <FormRadio 
                  key={opt} name="hzRear" label={opt} value={opt} 
                  checked={hzRear === opt} onChange={setHzRear} 
                />
              ))}
            </div>
          </FieldBlock>

          <FieldBlock title="Hand Signal">
            <div className="flex flex-col gap-1">
              {binaryOptions.map(opt => (
                <FormRadio 
                  key={opt} name="hzHand" label={opt} value={opt} 
                  checked={hzHand === opt} onChange={setHzHand} 
                />
              ))}
            </div>
          </FieldBlock>
        </div>

        {/* Row 2: Hazard Identification */}
        <FieldBlock title="Hazard Type / Source">
          <div className="grid grid-cols-3 gap-2">
            {hazardOptions.map(opt => (
              <FormRadio 
                key={opt} name="hazardType" label={opt} value={opt} 
                checked={hazardType === opt} onChange={setHazardType} 
              />
            ))}
          </div>
        </FieldBlock>

        {/* Row 3: Rider Response */}
        <FieldBlock title="Action Taken by Rider" pink>
          <div className="grid grid-cols-3 gap-2">
            {actionOptions.map(opt => (
              <FormRadio 
                key={opt} name="action" label={opt} value={opt} 
                checked={action === opt} onChange={setAction} 
              />
            ))}
          </div>
        </FieldBlock>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button 
            onClick={onClose} 
            className="px-5 py-2 rounded-lg border border-slate-300 text-[11px] font-bold text-slate-500 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-10 py-2 rounded-lg bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
          >
            {isEditing ? 'Update Point' : 'Save Critical Point'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default HazardModal;