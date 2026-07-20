import React from 'react';
import { COLOR_OPTIONS } from '@/lib/radiatorData';

function SpecItem({ label, value, isPrimary }) {
  return (
    <div className="flex flex-col min-w-0">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold leading-tight">
        {label}
      </span>
      <span
        key={String(value)}
        className={`text-[13px] font-bold leading-tight mt-0.5 rounded px-1 -mx-1 animate-flash ${isPrimary ? 'text-primary' : 'text-foreground'}`}
      >
        {value}
      </span>
    </div>
  );
}

export default function RadiatorSpecsTable({ selected, deltaT, colorCode, ralCode, connCode, radiatorType, valveType, highPressure, ventType, ventPosition, connSize, ventConnSize, drainValve }) {
  if (!selected) return null;

  const colorOpt = COLOR_OPTIONS.find(c => c.code === colorCode);
  const colorLabel = colorOpt ? `${colorCode} / RAL ${ralCode}` : `RAL ${ralCode}`;

  const isRRV = radiatorType === 'RRV';
  const num = (connCode || '').replace(/\D/g, '');

  // Position: 3 (right) or 1 (left) based on connection code
  const position = isRRV
    ? (['69', '98'].includes(num) ? '3' : '1')
    : (['12', '14', '68'].includes(num) ? '3' : '1');

  let ventSpec;
  if (ventType) {
    // Checkbox selected — "Воздухоотводчик" (code 1)
    let value;
    if (isRRV && ['89', '69'].includes(num) && valveType === 'ТВН') {
      value = `1 / поз. 1 и 3 / ${ventConnSize}`;
    } else {
      value = `1 / поз. ${position} / ${ventConnSize}`;
    }
    ventSpec = { label: 'Воздухоотводчик (L)', value };
  } else {
    // Checkbox not selected — "Штуцер воздух" (code 4)
    ventSpec = { label: 'Резьбовое под воздушник (L)', value: `4 / поз. ${position} / ${ventConnSize}` };
  }

  const connDisplay = valveType ? `${connCode} ${valveType}` : connCode;

  let centerDistance = '—';
  if (isRRV) {
    centerDistance = '50 мм';
  } else if (['12', '34', '14', '32'].includes(num)) {
    centerDistance = `${selected.height - 70} мм`;
  } else if (['68', '86'].includes(num)) {
    centerDistance = `${selected.sections * 45 - 45} мм`;
  } else if (['69', '89'].includes(num)) {
    centerDistance = '50 мм';
  }

  const specs = [
    { label: 'Модель', value: selected.model },
    { label: 'Секции', value: selected.sections },
    { label: 'Рядность', value: `${selected.tubes} труб.` },
    { label: 'Подключение', value: `${isRRV ? '31' : '2'} / ${connDisplay} / ${connSize}` },
    { label: 'Межосевое', value: centerDistance },
    { label: 'Глубина', value: `${selected.depth} мм` },
    { label: 'Длина', value: `${selected.length} мм` },
    { label: 'Высота', value: `${selected.height} мм` },
    { label: 'Вес', value: `${selected.totalWeight} кг` },
    { label: 'Цвет', value: colorLabel },
    { label: 'Давление', value: highPressure ? '16 бар' : '10 бар' },
    ventSpec,
    ...(drainValve ? [{ label: 'Резьбовое под дренаж (L)', value: `4 / поз. ${position === '3' ? '4' : '2'} / ${connSize}` }] : []),
    { label: 'Крепления', value: selected.bracketCount ? `KLK ${selected.bracketCount} шт` : '—' },
    { label: 'Q ном ΔT60', value: `${selected.qNomTotal} Вт` },
    { label: `Q расч ΔT${deltaT.toFixed(0)}`, value: `${selected.qRealTotal} Вт`, isPrimary: true },
  ];

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-3 py-3 border-t border-border/30">
      {specs.map((s, i) => (
        <SpecItem key={i} label={s.label} value={s.value} isPrimary={s.isPrimary} />
      ))}
    </div>
  );
}