import React from 'react';
import { RADIATOR_TYPES, getConnectionVariantsForType, CONNECTION_SIZES, CONNECTION_SIZE_RESTRICTIONS } from '@/lib/radiatorData';

export default function ConnectionVariants({
  radiatorType, connGroup, setConnGroup, connCode, setConnCode, connSize, setConnSize,
}) {
  const selectedType = RADIATOR_TYPES.find(t => t.id === radiatorType);
  const variants = selectedType ? getConnectionVariantsForType(radiatorType) : [];

  if (!selectedType || variants.length === 0) return null;

  const isRRV = radiatorType === 'RRV';
  const connNum = (connCode || '').replace(/\D/g, '');
  const restrictedSizes = CONNECTION_SIZE_RESTRICTIONS[connNum] || null;
  const showSizeSelector = isRRV || ['12', '34', '14', '32', '68', '86', '69', '89'].includes(connNum);
  const availableSizes = isRRV
    ? CONNECTION_SIZES.filter(s => s.rrvCode).map(s => ({ ...s, code: s.rrvCode }))
    : restrictedSizes
      ? CONNECTION_SIZES.filter(s => restrictedSizes.includes(s.code))
      : CONNECTION_SIZES;

  const handleVariantClick = (v) => {
    setConnGroup(v.groupId);
    setConnCode(v.code);
  };

  return (
    <div>
      <div className="text-[12px] font-semibold text-foreground mb-2">Варианты подключения</div>
      <div className="grid grid-cols-4 gap-2">
        {variants.map(v => {
          const isSelected = connGroup === v.groupId && connCode === v.code;
          const displayCode = v.valveType ? `${v.code} ${v.valveType}` : v.code;
          return (
            <button
              key={`${v.groupId}-${v.code}-${v.valveType}`}
              onClick={() => handleVariantClick(v)}
              className={`flex flex-col items-center justify-center py-2 rounded-premium transition-all ${
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground hover:border-white/20'
              }`}
            >
              <span className="text-[12px] font-bold">{displayCode}</span>
              <span className={`text-[9px] font-medium ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground/60'}`}>
                {v.surcharge > 0
                  ? `+${v.surcharge} €`
                  : (radiatorType === 'RRN' || radiatorType === 'Cambiotherm') ? 'без доплаты' : 'без наценки'}
              </span>
            </button>
          );
        })}
      </div>

      {showSizeSelector && (
        <div className="mt-3">
          <div className="text-[12px] font-semibold text-foreground mb-2">Размер подключения</div>
          <div className="grid grid-cols-4 gap-2">
            {availableSizes.map(s => {
              const isActive = connSize === s.code;
              return (
                <button
                  key={s.code}
                  onClick={() => setConnSize(s.code)}
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
      )}
    </div>
  );
}