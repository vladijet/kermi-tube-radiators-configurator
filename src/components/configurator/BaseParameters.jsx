import React from 'react';
import TemperatureMode from './TemperatureMode';

const RANGE_INPUT_CLS = "w-full px-3 py-2.5 text-[14px] font-bold text-foreground bg-card border border-border rounded-premium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";

export default function BaseParameters({
  requiredPower, setRequiredPower,
  flowTemp, setFlowTemp,
  returnTemp, setReturnTemp,
  airTemp, setAirTemp,
  minHeight, setMinHeight,
  maxHeight, setMaxHeight,
  minLength, setMinLength,
  maxLength, setMaxLength,
}) {
  return (
    <>
      {/* Диапазон высоты */}
      <div>
        <label className="text-[12px] font-semibold text-foreground mb-2 block">Диапазон высоты, мм</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input type="number" value={minHeight} onChange={e => setMinHeight(e.target.value)} className={RANGE_INPUT_CLS} />
            <span className="text-[10px] text-muted-foreground mt-0.5 block">Мин. высота</span>
          </div>
          <div>
            <input type="number" value={maxHeight} onChange={e => setMaxHeight(e.target.value)} className={RANGE_INPUT_CLS} />
            <span className="text-[10px] text-muted-foreground mt-0.5 block">Макс. высота</span>
          </div>
        </div>
      </div>

      {/* Диапазон длины */}
      <div>
        <label className="text-[12px] font-semibold text-foreground mb-2 block">Диапазон длины, мм</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input type="number" value={minLength} onChange={e => setMinLength(e.target.value)} className={RANGE_INPUT_CLS} />
            <span className="text-[10px] text-muted-foreground mt-0.5 block">Мин. длина</span>
          </div>
          <div>
            <input type="number" value={maxLength} onChange={e => setMaxLength(e.target.value)} className={RANGE_INPUT_CLS} />
            <span className="text-[10px] text-muted-foreground mt-0.5 block">Макс. длина</span>
          </div>
        </div>
      </div>

      {/* Требуемая мощность */}
      <div>
        <label className="text-[12px] font-semibold text-foreground mb-2 block">Требуемая мощность, Вт</label>
        <input
          type="number"
          value={requiredPower}
          min={100}
          step={50}
          onChange={e => setRequiredPower(e.target.value)}
          className="w-full px-4 py-2.5 text-[15px] font-bold text-foreground bg-card border border-border rounded-premium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Температурный режим */}
      <TemperatureMode
        flowTemp={flowTemp} setFlowTemp={setFlowTemp}
        returnTemp={returnTemp} setReturnTemp={setReturnTemp}
        airTemp={airTemp} setAirTemp={setAirTemp}
      />
    </>
  );
}