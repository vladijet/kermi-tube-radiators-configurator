import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// Fetches a server-rendered pseudo-3D SVG of the radiator and displays it.
// Debounced so rapid param changes don't flood the backend.
export default function RadiatorServerPreview({ sections, height, connectionCode, valveType, color, ventType }) {
  const [svg, setSvg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const num = (connectionCode || '').replace(/\D/g, '');
        const isRRV = ['69', '89', '96', '98'].includes(num);
        let ventSide;
        if (isRRV) {
          const vt = valveType || '';
          if (num === '69') ventSide = vt === 'ТВН' ? 'both' : 'right';
          else if (num === '89') ventSide = vt === 'ТВН' ? 'both' : 'left';
          else if (num === '96') ventSide = 'left';
          else if (num === '98') ventSide = 'right';
          else ventSide = '';
        } else {
          ventSide = ['12', '14', '68'].includes(num) ? 'right' : 'left';
        }
        const res = await base44.functions.invoke('renderRadiatorSvg', {
          sections: Number(sections) || 9,
          height: Number(height) || 600,
          connectionCode: connectionCode || 'N12',
          valveType: valveType || '',
          color: color || '#F4F4F4',
          ventSide,
          ventType: ventType || '',
        });
        if (!cancelled) {
          setSvg(res.data?.svg || '');
          setLoading(false);
        }
      } catch (_e) {
        if (!cancelled) {
          setSvg('');
          setLoading(false);
        }
      }
    }, 250);
    return () => { cancelled = true; clearTimeout(id); };
  }, [sections, height, connectionCode, valveType, color, ventType]);

  return (
    <div className="relative w-full h-full flex items-center justify-center p-6">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/40 z-10">
          <div className="w-8 h-8 border-4 border-white/10 border-t-primary rounded-full animate-spin" />
        </div>
      )}
      {svg ? (
        <div
          className="w-full h-full max-h-[72vh] flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        !loading && <div className="text-muted-foreground text-sm">Предпросмотр недоступен</div>
      )}
    </div>
  );
}