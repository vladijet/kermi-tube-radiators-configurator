import React from 'react';
import { ExternalLink } from 'lucide-react';

// Opens the mounting scheme page in a new browser tab, carrying the current
// radiator config as query params. The page renders the same front-view SVG as
// the configurator preview.
export default function MountingDiagramButton({ config }) {
  const handleOpen = () => {
    if (!config) return;
    const params = new URLSearchParams({
      article: config.article || '',
      series: config.series || '',
      model: config.selected?.model || '',
      tubes: String(config.selected?.tubes ?? ''),
      sections: String(config.selected?.sections ?? ''),
      height: String(config.selected?.height ?? ''),
      connectionCode: config.connCode || '',
      valveType: config.valveType || '',
      colorCode: config.colorCode || '',
      ralCode: config.ralCode || '',
      ventType: config.ventType || '',
      drainValve: config.drainValve ? '1' : '0',
    });
    window.open(`/mounting-scheme?${params.toString()}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      type="button"
      onClick={handleOpen}
      disabled={!config}
      className="flex items-center gap-2 px-3 py-2 rounded-premium bg-[#c5e315] text-white text-[12px] font-bold hover:bg-[#b3d414] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      title="Открыть схему монтажа"
    >
      <ExternalLink className="w-4 h-4" />
      Схема монтажа
    </button>
  );
}