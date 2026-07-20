import React from 'react';
import { calculateDeltaT } from '@/lib/radiatorCalc';

const DT_PRESETS = [
  { dt: 70, flow: 95, return: 85, air: 20 },
  { dt: 60, flow: 90, return: 70, air: 20 },
  { dt: 50, flow: 75, return: 65, air: 20 },
  { dt: 40, flow: 65, return: 55, air: 20 },
  { dt: 30, flow: 55, return: 45, air: 20 },
];

export default function TemperatureMode({ flowTemp, setFlowTemp, returnTemp, setReturnTemp, airTemp, setAirTemp }) {
  const deltaT = calculateDeltaT(flowTemp, returnTemp, airTemp);

  const activePreset = DT_PRESETS.find(p =>
    p.flow === Number(flowTemp) && p.return === Number(returnTemp) && p.air === Number(airTemp)
  );

  const handlePresetClick = (p) => {
    setFlowTemp(p.flow);
    setReturnTemp(p.return);
    setAirTemp(p.air);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-[12px] font-semibold text-foreground">Температурный режим, °C</label>
        <span className="text-[13px] font-bold text-primary">ΔT {Number.isInteger(deltaT) ? deltaT : deltaT.toFixed(1)}</span>
      </div>

      <div className="flex items-stretch gap-1 mb-1">
        <input
          type="number"
          value={flowTemp}
          onChange={e => setFlowTemp(e.target.value)}
          className="flex-1 min-w-0 px-1 py-2 text-center text-[15px] font-bold text-foreground bg-card border border-border rounded-premium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
        <span className="flex items-center text-[16px] font-bold text-muted-foreground">/</span>
        <input
          type="number"
          value={returnTemp}
          onChange={e => setReturnTemp(e.target.value)}
          className="flex-1 min-w-0 px-1 py-2 text-center text-[15px] font-bold text-foreground bg-card border border-border rounded-premium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
        <span className="flex items-center text-[16px] font-bold text-muted-foreground">/</span>
        <input
          type="number"
          value={airTemp}
          onChange={e => setAirTemp(e.target.value)}
          className="flex-1 min-w-0 px-1 py-2 text-center text-[15px] font-bold text-foreground bg-card border border-border rounded-premium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>
      <div className="flex items-center gap-1 mb-3 text-[9px] text-muted-foreground uppercase tracking-wide">
        <span className="flex-1 text-center">Подача</span>
        <span className="w-2" />
        <span className="flex-1 text-center">Обратка</span>
        <span className="w-2" />
        <span className="flex-1 text-center">Воздух</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {DT_PRESETS.map(preset => {
          const isActive = activePreset?.dt === preset.dt;
          return (
            <button
              key={preset.dt}
              onClick={() => handlePresetClick(preset)}
              className={`px-3 py-1.5 rounded-premium text-[12px] font-semibold transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground hover:border-white/20'
              }`}
            >
              ΔT {preset.dt}
            </button>
          );
        })}
      </div>
    </div>
  );
}