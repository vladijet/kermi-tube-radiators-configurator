import React from 'react';
import { formatEuro, calculateTotalPrice } from '@/lib/radiatorCalc';
import { Check } from 'lucide-react';

export default function ResultCard({ result, isSelected, onSelect, deltaT, colorCode, connGroup, connCode, highPressure }) {
  const totalPrice = calculateTotalPrice(result.basePrice, colorCode, connGroup, connCode, highPressure);
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
        isSelected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border/50 bg-card hover:border-border hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-11 h-11 rounded-xl font-bold text-sm ${
            isSelected ? 'bg-primary text-primary-foreground' : 'bg-white/5 text-muted-foreground'
          }`}>
            {result.tubes}-тр
          </div>
          <div>
            <div className="text-[15px] font-bold text-foreground">Модель {result.model}</div>
            <div className="text-[12px] text-muted-foreground">Глубина {result.depth} мм · Длина {result.length} мм · Вес {result.totalWeight} кг</div>
          </div>
        </div>
        {isSelected && (
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary">
            <Check className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
        )}
      </div>
      <div className="grid grid-cols-5 gap-2">
        <div className="text-center py-2 bg-white/5 rounded-lg">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Секций</div>
          <div className="text-[15px] font-bold text-foreground">{result.sections}</div>
        </div>
        <div className="text-center py-2 bg-white/5 rounded-lg">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Крепления</div>
          <div className="text-[14px] font-bold text-foreground">{result.bracketCount ? `${result.bracketCount} компл` : '—'}</div>
        </div>
        <div className="text-center py-2 bg-white/5 rounded-lg">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Q ном ΔT60</div>
          <div className="text-[15px] font-bold text-foreground">{result.qNomTotal}<span className="text-[10px] font-normal text-muted-foreground">Вт</span></div>
        </div>
        <div className="text-center py-2 bg-primary/10 rounded-lg">
          <div className="text-[10px] text-primary uppercase tracking-wide mb-0.5">Q расч ΔT{deltaT.toFixed(0)}</div>
          <div className="text-[15px] font-bold text-foreground">{result.qRealTotal}<span className="text-[10px] font-normal text-muted-foreground">Вт</span></div>
        </div>
        <div className="text-center py-2 bg-white/5 rounded-lg">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Цена</div>
          <div className="text-[14px] font-bold text-foreground">{formatEuro(totalPrice)}</div>
        </div>
      </div>
    </button>
  );
}