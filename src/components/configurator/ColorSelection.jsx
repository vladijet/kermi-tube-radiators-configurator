import React, { useState } from 'react';
import { POPULAR_RAL_COLORS, getRalColor } from '@/lib/ralColors';
import { Check } from 'lucide-react';

export default function ColorSelection({ ralCode, setRalCode }) {
  const [customInput, setCustomInput] = useState('');
  const active = getRalColor(ralCode);
  const isCustomActive = !POPULAR_RAL_COLORS.some(p => p.code === ralCode);

  const handleCustom = (val) => {
    const cleaned = val.replace(/[^0-9]/g, '').slice(0, 4);
    setCustomInput(cleaned);
    if (cleaned.length === 4) {
      setRalCode(cleaned);
    }
  };

  return (
    <div>
      <div className="text-[12px] font-semibold text-gray-500 mb-2">Цвет по RAL</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {POPULAR_RAL_COLORS.map(c => {
          const isActive = ralCode === c.code;
          return (
            <button
              key={c.code}
              onClick={() => { setRalCode(c.code); setCustomInput(''); }}
              className={`relative p-2.5 rounded-xl border-2 transition-all flex items-center gap-2.5 text-left ${
                isActive ? 'border-[#BFCE00] bg-[#BFCE00]/5' : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <span className="w-8 h-8 rounded-lg shrink-0 border border-black/10" style={{ backgroundColor: c.hex }} />
              <div className="min-w-0">
                <div className={`text-[12px] font-bold ${isActive ? 'text-[#333]' : 'text-gray-600'}`}>RAL {c.code}</div>
                <div className="text-[10px] text-gray-400 truncate">{c.name}</div>
              </div>
              {isActive && (
                <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-[#BFCE00]">
                  <Check className="w-2.5 h-2.5 text-white" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 p-3 rounded-xl border-2 border-dashed border-gray-200 bg-white">
        <label className="text-[12px] font-semibold text-gray-600 mb-2 block">Свой цвет по RAL</label>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-gray-400">RAL</span>
            <input
              type="text"
              value={isCustomActive ? ralCode : customInput}
              onChange={e => handleCustom(e.target.value)}
              placeholder="напр. 5015"
              maxLength={4}
              inputMode="numeric"
              className="w-24 px-3 py-2 text-[14px] font-bold text-[#333] bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#BFCE00] focus:ring-2 focus:ring-[#BFCE00]/20"
            />
          </div>
          <span className="w-9 h-9 rounded-lg border border-black/10 shrink-0" style={{ backgroundColor: active.hex }} />
          <div className="text-[11px] min-w-0">
            {active.found
              ? <span className="font-medium text-[#333]">{active.name}</span>
              : (ralCode.length === 4
                ? <span className="text-gray-400">RAL не найден в каталоге</span>
                : <span className="text-gray-400">Введите 4 цифры</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}