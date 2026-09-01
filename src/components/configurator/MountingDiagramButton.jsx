import React from 'react';
import { Eye } from 'lucide-react';

// Opens the mounting scheme page in a new browser tab, carrying the current
// radiator config as query params. Rendered as a borderless text link.
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
      className="flex items-center gap-1.5 bg-transparent text-[12px] font-semibold text-primary hover:text-primary/80 hover:underline underline-offset-4 transition-all disabled:opacity-50 disabled:no-underline"
      title="Открыть схему монтажа"
    >
      <Eye className="w-4 h-4" />
      Схема монтажа
    </button>
  );
}