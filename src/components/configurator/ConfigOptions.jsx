import React from 'react';
import { COLOR_OPTIONS, CONNECTION_GROUPS, getDefaultConnectionVariant, HIGH_PRESSURE_SURCHARGE } from '@/lib/radiatorData';
import { formatEuro } from '@/lib/radiatorCalc';
import { Palette, Link2, Gauge } from 'lucide-react';

function SectionTitle({ icon: Icon, children }) {
  return (
    <label className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-600 mb-2">
      <Icon className="w-3.5 h-3.5 text-[#BFCE00]" /> {children}
    </label>
  );
}

export default function ConfigOptions({ colorCode, setColorCode, connectionGroupId, setConnectionGroupId, connectionCode, setConnectionCode, highPressure, setHighPressure, basePrice }) {
  const group = CONNECTION_GROUPS.find(g => g.id === connectionGroupId);

  const handleGroupChange = (newId) => {
    setConnectionGroupId(newId);
    const def = getDefaultConnectionVariant(newId);
    if (def) setConnectionCode(def.code);
  };

  return (
    <div className="space-y-5">
      <div>
        <SectionTitle icon={Palette}>Цвет исполнения</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {COLOR_OPTIONS.map(c => (
            <button
              key={c.code}
              onClick={() => setColorCode(c.code)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl border text-[12px] font-medium transition-all ${
                colorCode === c.code
                  ? 'border-[#BFCE00] bg-[#BFCE00]/5 text-[#333]'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
              }`}
            >
              <span>{c.short}</span>
              <span className={`text-[10px] font-bold ${c.surcharge_percent > 0 ? 'text-[#BFCE00]' : 'text-gray-400'}`}>
                {c.surcharge_percent > 0 ? `+${c.surcharge_percent}%` : '0%'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle icon={Link2}>Тип подключения</SectionTitle>
        <select
          value={connectionGroupId}
          onChange={e => handleGroupChange(e.target.value)}
          className="w-full px-3.5 py-2.5 text-[14px] font-medium text-[#333] bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#BFCE00] focus:ring-2 focus:ring-[#BFCE00]/20 transition-all mb-2 cursor-pointer"
        >
          {CONNECTION_GROUPS.map(g => (
            <option key={g.id} value={g.id}>{g.label}</option>
          ))}
        </select>
        <div className="flex flex-wrap gap-2">
          {group?.variants.map(v => (
            <button
              key={v.code + v.valveType}
              onClick={() => setConnectionCode(v.code)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-all ${
                connectionCode === v.code
                  ? 'border-[#BFCE00] bg-[#BFCE00]/5 text-[#333]'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
              }`}
            >
              {v.label}
              {v.surcharge > 0 && <span className="text-[10px] font-bold text-[#BFCE00]">+{formatEuro(v.surcharge)}</span>}
            </button>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle icon={Gauge}>Дополнительные опции</SectionTitle>
        <button
          onClick={() => setHighPressure(!highPressure)}
          className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl border transition-all ${
            highPressure ? 'border-[#BFCE00] bg-[#BFCE00]/5' : 'border-gray-200 bg-white'
          }`}
        >
          <div className="text-left">
            <div className="text-[13px] font-semibold text-[#333]">Повышенное давление 16 атм</div>
            <div className="text-[11px] text-gray-400">Рабочее давление 16 бар вместо 10 бар</div>
          </div>
          <span className="text-[12px] font-bold text-[#BFCE00]">+{formatEuro(HIGH_PRESSURE_SURCHARGE)}</span>
        </button>
      </div>
    </div>
  );
}