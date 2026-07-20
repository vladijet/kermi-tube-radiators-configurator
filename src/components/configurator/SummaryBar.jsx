import React, { useState } from 'react';
import { formatEuro } from '@/lib/radiatorCalc';
import { COLOR_OPTIONS, findConnectionVariant } from '@/lib/radiatorData';
import { Copy, Check } from 'lucide-react';

export default function SummaryBar({ result, colorCode, connectionGroupId, connectionCode, highPressure, totalPrice, article }) {
  const [copied, setCopied] = useState(false);
  const color = COLOR_OPTIONS.find(c => c.code === colorCode);
  const variant = findConnectionVariant(connectionGroupId, connectionCode);
  const colorSurcharge = color ? result.basePrice * (color.surcharge_percent / 100) : 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${article} | Модель ${result.model}, ${result.sections} секц., ${result.length}мм`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 bg-gradient-to-br from-card to-background rounded-2xl border border-border/50">
      <div className="mb-3">
        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Артикул</div>
        <div className="flex items-center gap-2">
          <code className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-[14px] font-bold text-foreground font-mono break-all">{article}</code>
          <button
            onClick={handleCopy}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary hover:bg-primary/90 transition-colors shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-primary-foreground" /> : <Copy className="w-4 h-4 text-primary-foreground" />}
          </button>
        </div>
        {copied && <p className="text-[11px] text-primary font-medium mt-1">Артикул скопирован в буфер обмена</p>}
      </div>

      <div className="space-y-1.5 mb-4 text-[13px]">
        <div className="flex justify-between text-muted-foreground">
          <span>Базовая цена ({result.sections} секц.)</span>
          <span className="font-medium text-foreground">{formatEuro(result.basePrice)}</span>
        </div>
        {colorSurcharge > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Цвет: {color?.short} (+{color?.surcharge_percent}%)</span>
            <span className="font-medium text-foreground">+{formatEuro(colorSurcharge)}</span>
          </div>
        )}
        {variant && variant.surcharge > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Подключение: {variant.code}{variant.valveType ? ` ${variant.valveType}` : ''}</span>
            <span className="font-medium text-foreground">+{formatEuro(variant.surcharge)}</span>
          </div>
        )}
        {highPressure && (
          <div className="flex justify-between text-muted-foreground">
            <span>Давление 16 атм</span>
            <span className="font-medium text-foreground">+{formatEuro(227.53)}</span>
          </div>
        )}
        <div className="flex justify-between pt-2 border-t border-border">
          <span className="font-bold text-foreground">Итого с НДС</span>
          <span className="text-[18px] font-bold text-foreground">{formatEuro(totalPrice)}</span>
        </div>
      </div>
    </div>
  );
}