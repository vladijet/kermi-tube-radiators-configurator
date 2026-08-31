import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { getRalColor } from '@/lib/ralColors';
import { Loader2 } from 'lucide-react';

// Replicates the ventSide logic from RadiatorServerPreview so the page renders
// the identical front-view SVG as the configurator preview.
function calcVentSide(connectionCode, valveType) {
  const num = (connectionCode || '').replace(/\D/g, '');
  const isRRV = ['69', '89', '96', '98'].includes(num);
  if (isRRV) {
    const vt = valveType || '';
    if (num === '69') return vt === 'ТВН' ? 'both' : 'right';
    if (num === '89') return vt === 'ТВН' ? 'both' : 'left';
    if (num === '96') return 'left';
    if (num === '98') return 'right';
    return '';
  }
  return ['12', '14', '68'].includes(num) ? 'right' : 'left';
}

export default function MountingScheme() {
  const [params] = useState(() => new URLSearchParams(window.location.search));
  const [svg, setSvg] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const article = params.get('article') || '';
  const sections = Number(params.get('sections')) || 9;
  const height = Number(params.get('height')) || 600;
  const connectionCode = params.get('connectionCode') || 'N12';
  const valveType = params.get('valveType') || '';
  const ralCode = params.get('ralCode') || '9016';
  const ventType = params.get('ventType') || '';
  const drainValve = params.get('drainValve') === '1';
  const color = getRalColor(ralCode).hex;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await base44.functions.invoke('renderRadiatorSvg', {
          sections,
          height,
          connectionCode,
          valveType,
          color,
          ventSide: calcVentSide(connectionCode, valveType),
          ventType,
          drainValve,
        });
        if (cancelled) return;
        if (res?.data?.svg) {
          setSvg(res.data.svg);
        } else {
          setError(true);
        }
      } catch (_e) {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-6 py-10 print:py-4">
      <div className="w-full max-w-[760px] flex flex-col items-center">
        <div className="w-full text-center mb-6">
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">Артикул</div>
          <h1 className="text-[20px] sm:text-[26px] font-bold text-neutral-900 break-all leading-tight mt-1">
            {article || '—'}
          </h1>
        </div>

        <div className="w-full flex-1 flex items-center justify-center min-h-[60vh]">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-neutral-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm">Загрузка схемы…</span>
            </div>
          ) : error ? (
            <div className="text-neutral-400 text-sm">Схема недоступна</div>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center [&>svg]:max-h-[78vh] [&>svg]:max-w-full"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          )}
        </div>
      </div>
    </div>
  );
}