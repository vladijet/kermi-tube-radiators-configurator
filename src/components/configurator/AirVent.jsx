import React from 'react';
import { VENT_TYPES, HIGH_PRESSURE_SURCHARGE, CONNECTION_SIZES } from '@/lib/radiatorData';
import { formatEuro } from '@/lib/radiatorCalc';

export default function AirVent({ radiatorType, ventType, setVentType, ventConnSize, setVentConnSize, includeBracketKLK, setIncludeBracketKLK, highPressure, setHighPressure, drainValve, setDrainValve }) {
  const isVent = ventType === '1';
  const isSchutz = !isVent;
  const vent = VENT_TYPES.find(v => v.code === '1');
  const isRRV = radiatorType === 'RRV';
  const availableSizes = isRRV
    ? CONNECTION_SIZES.filter(s => s.rrvCode).map(s => ({ ...s, code: s.rrvCode }))
    : CONNECTION_SIZES.filter(s => ['12', '34'].includes(s.code));

  const sizeSelector = (
    <div className="mt-1 pl-6">
      <div className="text-[12px] font-semibold text-foreground mb-2">Размер подключения</div>
      <div className="grid grid-cols-4 gap-2">
        {availableSizes.map(s => {
          const isActive = ventConnSize === s.code;
          return (
            <button
              key={s.code}
              onClick={() => setVentConnSize(s.code)}
              className={`flex flex-col items-center justify-center py-2 rounded-premium transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground hover:border-white/20'
              }`}
            >
              <span className="text-[12px] font-bold">{s.label}</span>
              <span className={`text-[9px] font-medium ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground/60'}`}>
                без доплаты
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Штуцер для воздухоотводчика (L) */}
      <label className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-all">
        <input
          type="radio"
          name="ventOption"
          checked={isSchutz}
          onChange={() => setVentType(null)}
          className="w-4 h-4 accent-primary"
        />
        <span className="text-[13px] font-semibold text-foreground flex-1">Резьбовое под воздухоотводчик (L)</span>
        <span className="text-[11px] text-muted-foreground font-medium">+{formatEuro(0)}</span>
      </label>

      {isSchutz && sizeSelector}

      {/* Воздухоотводчик в комплекте */}
      <label className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-all">
        <input
          type="radio"
          name="ventOption"
          checked={isVent}
          onChange={() => setVentType('1')}
          className="w-4 h-4 accent-primary"
        />
        <span className="text-[13px] font-semibold text-foreground flex-1">Воздухоотводчик в комплекте (L)</span>
        <span className="text-[11px] text-muted-foreground font-medium">
          +{formatEuro(vent.surcharge)}
        </span>
      </label>

      {isVent && sizeSelector}

      {/* Резьбовое под дренажный кран */}
      <label className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-all">
        <input
          type="checkbox"
          checked={drainValve}
          onChange={e => setDrainValve(e.target.checked)}
          className="w-4 h-4 rounded accent-primary"
        />
        <span className="text-[13px] font-semibold text-foreground flex-1">Резьбовое под дренажный кран (Е)</span>
        <span className="text-[11px] text-muted-foreground font-medium">+{formatEuro(0)}</span>
      </label>

      {/* High pressure */}
      <label className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-all">
        <input
          type="checkbox"
          checked={highPressure}
          onChange={e => setHighPressure(e.target.checked)}
          className="w-4 h-4 rounded accent-primary"
        />
        <span className="text-[13px] font-semibold text-foreground flex-1">Повышенное давление 16 бар</span>
        <span className="text-[11px] text-muted-foreground font-medium">+{formatEuro(HIGH_PRESSURE_SURCHARGE)}</span>
      </label>

      {/* Крепление KLK в комплекте */}
      <label className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-all">
        <input
          type="checkbox"
          checked={includeBracketKLK}
          onChange={e => setIncludeBracketKLK(e.target.checked)}
          className="w-4 h-4 rounded accent-primary"
        />
        <span className="text-[13px] font-semibold text-foreground flex-1">Крепление KLK в комплекте</span>
        <span className="text-[11px] text-muted-foreground font-medium">+{formatEuro(0)}</span>
      </label>
    </div>
  );
}