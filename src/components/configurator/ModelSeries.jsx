import React from 'react';
import { RADIATOR_TYPES } from '@/lib/radiatorData';

export default function ModelSeries({ radiatorType, setRadiatorType }) {
  return (
    <div>
      <div className="text-[12px] font-semibold text-foreground mb-2">Серия</div>
      <div className="flex flex-wrap gap-2">
        {RADIATOR_TYPES.map(type => {
          const isActive = radiatorType === type.id;
          return (
            <button
              key={type.id}
              onClick={() => setRadiatorType(type.id)}
              className={`px-3 py-2 rounded-premium text-[12px] font-semibold transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground hover:border-white/20'
              }`}
            >
              {type.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}