import React, { useMemo } from 'react';
import { SECTION_LENGTH, MIN_SECTIONS, MAX_SECTIONS, DEPTH_BY_TUBES } from '@/lib/radiatorData';

const TUBE_OPTIONS = [2, 3, 4, 5, 6];

export default function ExtendedParameters({
  selectedTubes, setSelectedTubes,
  height, setHeight,
  availableHeights,
  minHeight, maxHeight,
  minLength, maxLength,
  selectedSections, setSelectedSections,
  availableOptions,
  sectionVariants,
  selected,
  onSelectVariant,
}) {
  const avail = availableOptions || { tubes: new Set(), heights: new Set(), sections: new Set() };

  const visibleTubes = TUBE_OPTIONS.filter(t => avail.tubes.has(t));

  const filteredHeights = useMemo(() => {
    return availableHeights.filter(h =>
      h >= Number(minHeight || 0) && h <= Number(maxHeight || 99999) && avail.heights.has(h)
    );
  }, [availableHeights, minHeight, maxHeight, avail]);

  return (
    <>
      {/* Количество рядов/трубок */}
      {visibleTubes.length > 0 && (
        <div>
          <label className="text-[12px] font-semibold text-foreground mb-2 block">Количество рядов/трубок</label>
          <div className="flex flex-wrap gap-2">
            {visibleTubes.map(t => {
              const isActive = selectedTubes === t;
              return (
                <button
                  key={t}
                  onClick={() => setSelectedTubes(t)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full text-[12px] font-bold transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border text-muted-foreground hover:border-white/20'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
          {selectedTubes && (
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Монтажная глубина: {DEPTH_BY_TUBES[selectedTubes]} мм
            </p>
          )}
        </div>
      )}

      {/* Высота */}
      {filteredHeights.length > 0 && (
        <div>
          <label className="text-[12px] font-semibold text-foreground mb-2 block">Высота</label>
          <div className="flex flex-wrap gap-2">
            {filteredHeights.map(h => {
              const isActive = height === h;
              return (
                <button
                  key={h}
                  onClick={() => setHeight(h)}
                  className={`px-3 py-1.5 rounded-premium text-[12px] font-semibold transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border text-muted-foreground hover:border-white/20'
                  }`}
                >
                  {h} мм
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Длина и секции */}
      {sectionVariants && sectionVariants.length > 0 && (
        <div>
          <label className="text-[12px] font-semibold text-foreground mb-2 block">Длина и секции</label>
          <div className="grid grid-cols-2 gap-2">
            {sectionVariants.map(variant => {
              const isActive = selected?.sections === variant.sections;
              return (
                <button
                  key={variant.sections}
                  onClick={() => onSelectVariant(variant)}
                  className={`px-2 py-1.5 rounded-premium text-[11px] font-semibold transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border text-muted-foreground hover:border-white/20'
                  }`}
                >
                  {variant.length} мм / {variant.sections} секц
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}