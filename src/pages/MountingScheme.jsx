import React, { useMemo } from 'react';
import { getRalColor } from '@/lib/ralColors';
import { getMountingDimensions } from '@/lib/mountingGeometry';
import MountingDrawing from '@/components/mounting/MountingDrawing';
import { ExternalLink } from 'lucide-react';

export default function MountingScheme() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const article = params.get('article') || '';
  const series = params.get('series') || 'RRN';
  const model = params.get('model') || '';
  const tubes = Number(params.get('tubes')) || 0;
  const sections = Number(params.get('sections')) || 0;
  const height = Number(params.get('height')) || 0;
  const connectionCode = params.get('connectionCode') || 'N12';
  const valveType = params.get('valveType') || '';
  const ralCode = params.get('ralCode') || '9016';
  const color = getRalColor(ralCode).hex;
  const ventType = params.get('ventType') || '';
  const drainValve = params.get('drainValve') === '1';

  const hasParams = sections > 0 && height > 0 && !!model;
  const dims = useMemo(
    () => getMountingDimensions({ model, series, sections, height, tubes }),
    [model, series, sections, height, tubes]
  );

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-4 py-8 print:py-2 print:px-0">
      <div className="w-full max-w-[1100px] flex flex-col items-center">
        <div className="w-full text-center mb-4 print:mb-2">
          <h1 className="text-[20px] sm:text-[24px] font-bold text-neutral-900 uppercase tracking-wide">
            Схема монтажа радиатора
          </h1>
          <div className="text-[10px] sm:text-[12px] font-medium text-neutral-500 break-all leading-tight mt-1.5">
            {article || '—'}
          </div>
        </div>

        <div className="w-full flex-1 flex items-center justify-center min-h-[50vh]">
          {hasParams ? (
            <MountingDrawing
              dims={dims}
              sections={sections}
              height={height}
              connectionCode={connectionCode}
              valveType={valveType}
              color={color}
              ventType={ventType}
              drainValve={drainValve}
              series={series}
            />
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

      </div>
    </div>
  );
}