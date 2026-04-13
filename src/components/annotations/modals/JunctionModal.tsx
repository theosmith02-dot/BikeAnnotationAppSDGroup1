/* -------------------------------------------------------------------------- */
/* TRIPS Bike Annotation - Junctions Modal                                    */
/* -------------------------------------------------------------------------- */

import React, { useState } from 'react';
import { ModalShell, FieldBlock, FormRadio } from '../../ui/ModalElements';

interface JunctionModalProps {
  onClose: () => void;
  onSave: (data: Record<string, any>) => void;
  defaults?: Record<string, any>;
  isEditing?: boolean;
}

const JunctionModal: React.FC<JunctionModalProps> = ({ 
  onClose, 
  onSave, 
  defaults = {}, 
  isEditing = false 
}) => {
  // State initialization with defaults for Edit Mode
  const [contactingType, setContactingType] = useState(defaults.contactingType || 'Street');
  const [junctionControlType, setJunctionControlType] = useState(defaults.junctionControlType || 'Some-Stop');
  const [riderControlType, setRiderControlType] = useState(defaults.riderControlType || 'No Control');
  const [conditions, setConditions] = useState(defaults.conditions || 'Clear Visibility');
  const [why, setWhy] = useState(defaults.why || '');
  const [trafficEntities, setTrafficEntities] = useState<string[]>(
    Array.isArray(defaults.trafficEntities) ? defaults.trafficEntities : (defaults.trafficEntities ? defaults.trafficEntities.split(' / ') : ['No Traffic'])
  );
  const [movementType, setMovementType] = useState(defaults.movementType || 'Combo movement');
  const [turnDirection, setTurnDirection] = useState(defaults.turnDirection || 'Go Straight');
  const [scanFront, setScanFront] = useState(defaults.scanFront || 'Yes');
  const [scanRear, setScanRear] = useState(defaults.scanRear || 'No');
  const [handSignal, setHandSignal] = useState(defaults.handSignal || 'No');
  const [stopBehavior, setStopBehavior] = useState(defaults.stopBehavior || 'Appropriate Stop/Yield');
  const [riskyBehavior, setRiskyBehavior] = useState(defaults.riskyBehavior || 'No');
  const [riskyExplain, setRiskyExplain] = useState(defaults.riskyExplain || '');
  const [ridingSurface, setRidingSurface] = useState(defaults.ridingSurface || 'Not changed');

  const toggleEntity = (entity: string) => {
    setTrafficEntities((prev) =>
      prev.includes(entity) ? prev.filter((e) => e !== entity) : [...prev.filter((e) => e !== 'No Traffic'), entity]
    );
  };

  const handleOk = () => {
    onSave({
      contactingType, junctionControlType, riderControlType, conditions, why,
      trafficEntities, movementType, turnDirection, scanFront, scanRear, 
      handSignal, stopBehavior, riskyBehavior, riskyExplain, ridingSurface
    });
  };

  return (
    <ModalShell title={isEditing ? 'Edit — Conflict Point: Junctions' : 'Conflict Point - Junctions'} onClose={onClose}>
      {isEditing && (
        <div className="mb-3 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-[11px] text-indigo-700 font-medium">
          Editing existing annotation — timestamp and screenshot will be preserved.
        </div>
      )}

      {/* Scaled container to ensure vertical fit */}
      <div className="space-y-3 transform scale-[0.96] origin-top">
        <div className="grid grid-cols-4 gap-2">
          <FieldBlock title="Contacting Type">
            {['Street', 'Driveway with signals'].map((v) => (
              <FormRadio key={v} name="contactingType" value={v} checked={contactingType === v} onChange={setContactingType} label={v} />
            ))}
          </FieldBlock>

          <FieldBlock title="Junction Control">
            <div className="space-y-0.5">
              {['Traffic Light', 'All-Stop', 'Some-Stop', 'Yield', 'Roundabout', 'Other', 'No Control'].map((v) => (
                <FormRadio key={v} name="junctionControlType" value={v} checked={junctionControlType === v} onChange={setJunctionControlType} label={v} />
              ))}
            </div>
          </FieldBlock>

          <FieldBlock title="Rider Control">
            <div className="space-y-0.5">
              {['Red Light', 'Red Ped Light', 'Stop Sign', 'Green Light', 'Green Ped Light', 'Yield', 'Roundabout', 'Other', 'No Control'].map((v) => (
                <FormRadio key={v} name="riderControlType" value={v} checked={riderControlType === v} onChange={setRiderControlType} label={v} />
              ))}
            </div>
          </FieldBlock>

          <FieldBlock title="Conditions & Traffic">
            <FormRadio name="conditions" value="Clear Visibility" checked={conditions === 'Clear Visibility'} onChange={setConditions} label="Clear" />
            <FormRadio name="conditions" value="Low visibility (blind corner)" checked={conditions === 'Low visibility (blind corner)'} onChange={setConditions} label="Low Vis" />
            <input 
              value={why} 
              onChange={(e) => setWhy(e.target.value)} 
              className="w-full border border-slate-300 rounded px-2 py-0.5 text-[10px] mt-1 outline-none focus:ring-1 focus:ring-indigo-500" 
              placeholder="Why?" 
            />
            
            <div className="grid grid-cols-2 gap-1 pt-2 text-[10px]">
              {['Vehicles', 'Pedestrians', 'Other Bicyclist', 'No Traffic'].map((item) => (
                <label key={item} className="flex items-center gap-1 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="accent-indigo-600"
                    checked={trafficEntities.includes(item)} 
                    onChange={() => item === 'No Traffic' ? setTrafficEntities(['No Traffic']) : toggleEntity(item)} 
                  />
                  {item}
                </label>
              ))}
            </div>

            <div className="pt-2 space-y-0.5 border-t border-slate-100 mt-2">
              {['Vehicle movement', 'Ped movement (cross)', 'Combo movement'].map((v) => (
                <FormRadio key={v} name="movementType" value={v} checked={movementType === v} onChange={setMovementType} label={v} />
              ))}
            </div>

            <div className="flex gap-2 pt-2 flex-wrap border-t border-slate-100 mt-2">
              {['Left Turn', 'Right Turn', 'Go Straight'].map((v) => (
                <FormRadio key={v} name="turnDirection" value={v} checked={turnDirection === v} onChange={setTurnDirection} label={v} />
              ))}
            </div>
          </FieldBlock>
        </div>

        {/* Behavioral Section */}
        <div className="border-t border-slate-200 pt-3">
          <div className="grid grid-cols-6 gap-2">
            <FieldBlock title="Scan (F)" pink>
              <div className="space-y-0.5">
                {['Yes', 'Partial', 'No', 'N/R', 'N/O'].map((v) => (
                  <FormRadio key={v} name="scanFront" value={v} checked={scanFront === v} onChange={setScanFront} label={v} />
                ))}
              </div>
            </FieldBlock>

            <FieldBlock title="Scan (R)" pink>
              <div className="space-y-0.5">
                {['Yes', 'No', 'N/R', 'N/O'].map((v) => (
                  <FormRadio key={v} name="scanRear" value={v} checked={scanRear === v} onChange={setScanRear} label={v} />
                ))}
              </div>
            </FieldBlock>

            <FieldBlock title="Signal" pink>
              <div className="space-y-0.5">
                {['Correct', 'Alt Right', 'Stop', 'Audible', 'Incorrect', 'No', 'N/R'].map((v) => (
                  <FormRadio key={v} name="handSignal" value={v} checked={handSignal === v} onChange={setHandSignal} label={v} />
                ))}
              </div>
            </FieldBlock>

            <FieldBlock title="Stop" pink>
              <div className="space-y-0.5">
                {['Appropriate', 'Incomplete', 'No', 'N/R'].map((v) => (
                  <FormRadio key={v} name="stopBehavior" value={v} checked={stopBehavior === v} onChange={setStopBehavior} label={v} />
                ))}
              </div>
            </FieldBlock>

            <FieldBlock title="Risky" pink>
              <FormRadio name="risky" value="Yes" checked={riskyBehavior === 'Yes'} onChange={setRiskyBehavior} label="Yes" />
              <FormRadio name="risky" value="No" checked={riskyBehavior === 'No'} onChange={setRiskyBehavior} label="No" />
              {riskyBehavior === 'Yes' && (
                <input 
                  value={riskyExplain} 
                  onChange={(e) => setRiskyExplain(e.target.value)} 
                  className="w-full border border-slate-300 rounded px-1 text-[9px] mt-1 outline-none" 
                  placeholder="Explain" 
                />
              )}
            </FieldBlock>

            <FieldBlock title="Surface" pink>
              {['Changed', 'Not changed'].map((v) => (
                <FormRadio key={v} name="surface" value={v} checked={ridingSurface === v} onChange={setRidingSurface} label={v} />
              ))}
            </FieldBlock>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button onClick={onClose} className="px-5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold hover:bg-slate-50">
            Cancel
          </button>
          <button 
            onClick={handleOk} 
            className="px-8 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 shadow-sm"
          >
            {isEditing ? 'Save Changes' : 'Ok'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default JunctionModal;