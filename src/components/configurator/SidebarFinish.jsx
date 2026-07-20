import React, { useState, useRef, useEffect } from 'react';
import { COLOR_OPTIONS, HIGH_PRESSURE_SURCHARGE } from '@/lib/radiatorData';
import { getRalColor, POPULAR_RAL_COLORS } from '@/lib/ralColors';
import { formatEuro } from '@/lib/radiatorCalc';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

const RAL_SVG_URL = 'https://media.base44.com/images/public/6a45366d13c007bdd7e17353/2fa2cae87_ral.svg';

const swatchStyle = (hex) => ({
  backgroundColor: hex,
  WebkitMaskImage: `url(${RAL_SVG_URL})`,
  maskImage: `url(${RAL_SVG_URL})`,
  WebkitMaskSize: 'contain',
  maskSize: 'contain',
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
  WebkitMaskPosition: 'center',
  maskPosition: 'center',
});

export default function SidebarFinish({
  ralCode, setRalCode,
  colorCode, setColorCode,
  highPressure, setHighPressure,
  includeBracketKLK, setIncludeBracketKLK,
}) {
  const colorInfo = getRalColor(ralCode);
  const isColorPaletteEnabled = ['CF', 'AF', 'ZK'].includes(colorCode);
  const [popularColorsOpen, setPopularColorsOpen] = useState(false);
  const [moreColorsOpen, setMoreColorsOpen] = useState(false);
  const paletteRef = useRef(null);

  useEffect(() => {
    if (!popularColorsOpen) return;
    const handleClickOutside = (e) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target)) {
        setPopularColorsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [popularColorsOpen]);

  useEffect(() => {
    if (popularColorsOpen && paletteRef.current) {
      const timer = setTimeout(() => {
        paletteRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [popularColorsOpen]);

  const extraColors = COLOR_OPTIONS.slice(1);

  const handleRalChange = (value) => {
    const sanitized = value.replace(/\D/g, '').slice(0, 4);
    setRalCode(sanitized);
    if (sanitized && sanitized !== '9016' && colorCode !== 'CF' && colorCode !== 'ZK') {
      setColorCode('CF');
    }
  };

  const renderColorButton = (color) => {
    const isActive = colorCode === color.code;
    return (
      <button
        key={color.code}
        onClick={() => setColorCode(color.code)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-premium text-[12px] font-semibold transition-all text-left ${
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'bg-card border border-border text-muted-foreground hover:border-white/20'
        }`}
      >
        <span className="flex-1 leading-tight">{color.label}</span>
        <span className={`text-[10px] font-bold ml-2 shrink-0 ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground/60'}`}>
          {color.surcharge_percent === 0 ? 'без наценки' : `+${color.surcharge_percent}%`}
        </span>
      </button>
    );
  };

  return (
    <div className="space-y-7">
      <div>
        <div className="text-[12px] font-semibold text-foreground mb-2">Цвет / покрытие</div>

        {/* RAL input + palette */}
        <div ref={paletteRef}>
          <div className={`flex items-center gap-2 transition-opacity ${isColorPaletteEnabled ? '' : 'opacity-40 pointer-events-none'}`}>
            <label className="text-[12px] font-semibold text-foreground shrink-0">RAL</label>
            <input
              type="text"
              value={ralCode}
              onChange={e => handleRalChange(e.target.value)}
              maxLength={4}
              placeholder="9016"
              disabled={!isColorPaletteEnabled}
              className="w-20 px-3 py-2 text-[14px] font-bold text-foreground bg-card border border-border rounded-premium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setPopularColorsOpen(v => !v)}
              disabled={!isColorPaletteEnabled}
              className="w-8 h-8 shrink-0 rounded-md overflow-hidden cursor-pointer transition-all disabled:cursor-not-allowed"
              title={colorInfo.name}
            >
              <div className="w-full h-full" style={swatchStyle(colorInfo.hex)} />
            </button>
            <span className="text-[11px] text-muted-foreground truncate flex-1">{colorInfo.name}</span>
          </div>

          {/* Популярные цвета */}
          <Collapsible open={popularColorsOpen} onOpenChange={setPopularColorsOpen}>
            <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up data-[state=closed]:opacity-0 data-[state=open]:opacity-100 transition-opacity duration-300">
              <button
                type="button"
                onClick={() => setPopularColorsOpen(false)}
                className="w-full flex items-center justify-between mt-2 mb-2 px-1"
              >
                <span className="text-[12px] font-semibold text-foreground">Популярные цвета</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground rotate-180" />
              </button>
              <div className="grid grid-cols-3 gap-2">
                {POPULAR_RAL_COLORS.map((color) => {
                  const isActive = ralCode === color.code;
                  return (
                    <button
                      key={color.code}
                      onClick={() => { setRalCode(color.code); if (colorCode !== 'ZK') setColorCode(color.code === '9016' ? 'AF' : 'CF'); }}
                      className={`flex flex-col items-center p-2 rounded-lg border transition-all cursor-pointer ${isActive ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
                    >
                      <div className="w-7 h-7 mb-1" style={swatchStyle(color.hex)} />
                      <span className="text-[10px] font-bold text-center leading-tight">RAL {color.code}</span>
                    </button>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Дополнительные опции в подкате */}
        <Collapsible open={moreColorsOpen} onOpenChange={setMoreColorsOpen} className="mt-3">
          <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-2 rounded-premium text-[12px] font-semibold bg-card border border-border text-muted-foreground hover:border-white/20 transition-all">
            <span>Другие покрытия</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${moreColorsOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1.5 mt-1.5">
            {extraColors.map(renderColorButton)}
          </CollapsibleContent>
        </Collapsible>
      </div>

    </div>
  );
}