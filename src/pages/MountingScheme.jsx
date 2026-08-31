import React, { useMemo } from 'react';
import { getRalColor } from '@/lib/ralColors';
import { getMountingDimensions } from '@/lib/mountingGeometry';
import MountingDrawing from '@/components/mounting/MountingDrawing';
import { Printer, ExternalLink } from 'lucide-react';

export default function MountingScheme() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const article = params.get('article') || '';
  const series = params.get('series') || 'RRN';
  const model = params.get('model') || '';
  const tubes = Number(params.get('tubes')) || 0;
  const sections = Number(params.get('sections')) || 0;
  const height = Number(params.get('height')) || 0;
  const connectionCode = params.get('connectionCode') || 'N12';
  const ralCode = params.get('ralCode') || '9016';
  const color = getRalColor(ralCode).hex;

  const hasParams = sections > 0 && height > 0 && !!model;
  const dims = useMemo(
    () => getMountingDimensions({ model, series, sections, height, tubes }),
    [model, series, sections, height, tubes]
  );

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-4 py-8 print:py-2 print:px-0">
      <div className="w-full max-w-[1100px] flex flex-col items-center">
        <div className="w-full text-center mb-4 print:mb-2">
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">Артикул</div>
          <h1 className="text-[20px] sm:text-[24px] font-bold text-neutral-900 break-all leading-tight mt-1">
            {article || '—'}
          </h1>
        </div>

        <div className="w-full flex-1 flex items-center justify-center min-h-[50vh]">
          {hasParams ? (
            <MountingDrawing dims={dims} connectionCode={connectionCode} color={color} />
          ) : (
            <div className="flex flex-col items-center gap-3 text-center max-w-md">
              <ExternalLink className="w-10 h-10 text-neutral-300" />
              <p className="text-[15px] font-semibold text-neutral-600">Схема монтажа доступна из конфигуратора</p>
              <p className="text-[13px] text-neutral-400">
                Подберите радиатор и нажмите «Схема монтажа» в карточке варианта, чтобы открыть технический чертёж.
              </p>
            </div>
          )}
        </div>

        <div className="no-print mt-4 flex items-center gap-2 text-neutral-400 text-xs">
          <Printer className="w-4 h-4" />
          <span>Для печати используйте Ctrl + P (ориентация — альбомная)</span>
        </div>
      </div>
    </div>
  );
}