import React from 'react';
import ResultCard from './ResultCard';
import { Search } from 'lucide-react';

export default function ResultsList({ results, selectedModel, onSelect, deltaT, colorCode, connGroup, connCode, highPressure }) {
  if (!results.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
          <Search className="w-6 h-6 text-muted-foreground/50" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Нет подходящих вариантов</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Уменьшите требуемую мощность или выберите другую высоту</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {results.map(r => (
        <ResultCard
          key={r.model}
          result={r}
          isSelected={selectedModel === r.model}
          onSelect={() => onSelect(r)}
          deltaT={deltaT}
          colorCode={colorCode}
          connGroup={connGroup}
          connCode={connCode}
          highPressure={highPressure}
        />
      ))}
    </div>
  );
}