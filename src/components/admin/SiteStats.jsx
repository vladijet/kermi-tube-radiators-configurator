import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { FileSpreadsheet, Globe, Tag } from 'lucide-react';
import FunnelView, { EVENT_LABELS, PERIODS, computeCounts } from '@/components/admin/FunnelView';

function topEntries(events, field, emptyLabel) {
  const map = {};
  events.forEach((e) => {
    const key = e[field] || emptyLabel;
    map[key] = (map[key] || 0) + 1;
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

export default function SiteStats({ partner }) {
  const [period, setPeriod] = useState('all');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!partner) return;
    let cancelled = false;
    setLoading(true);
    const params = { partner_id: partner.id, source: 'site' };
    const days = PERIODS.find((p) => p.key === period)?.days;
    if (days !== null && days !== undefined) {
      const since = new Date();
      since.setDate(since.getDate() - days);
      since.setHours(0, 0, 0, 0);
      params.created_date = { $gte: since.toISOString() };
    }
    base44.entities.WidgetEvent.filter(params, '-created_date', 5000)
      .then((res) => {
        if (!cancelled) setEvents(res || []);
      })
      .catch(() => {
        if (!cancelled) setEvents([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [partner, period]);

  const referrers = useMemo(() => topEntries(events, 'referrer', '(прямой заход)'), [events]);
  const utmSources = useMemo(() => topEntries(events, 'utm_source', '(не указан)'), [events]);

  const handleExportExcel = () => {
    import('xlsx').then((XLSX) => {
      const counts = computeCounts(events);
      const funnelRows = EVENT_LABELS.map((e) => ({
        'Этап воронки': e.label,
        'Количество': counts[e.type] || 0,
        'Конверсия %': counts.open ? Math.round(((counts[e.type] || 0) / counts.open) * 100) : 0,
      }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(funnelRows), 'Воронка');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
        referrers.map(([k, v]) => ({ 'Реферер': k, 'Переходы': v })),
        ), 'Рефереры');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
        utmSources.map(([k, v]) => ({ 'UTM source': k, 'Переходы': v })),
        ), 'UTM');
      XLSX.writeFile(wb, `Статистика_сайта_${period}.xlsx`);
    });
  };

  if (!partner) {
    return (
      <div className="py-20 text-center">
        <p className="text-[14px] font-semibold text-foreground">Партнёр-сайт не найден</p>
        <p className="text-[12px] text-muted-foreground mt-1">
          Создайте запись партнёра с полем «Техническая запись сайта» (is_site = true), чтобы собирать статистику по прямым заходам на сайт.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[18px] font-bold text-foreground">Статистика по сайту</h2>
          <p className="text-[12px] text-muted-foreground">Прямые заходы на rr.kermi-configurator.com</p>
        </div>
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[12px] font-bold hover:bg-primary/20 transition-all"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Excel
        </button>
      </div>

      <div className="flex items-center gap-1.5 mb-5">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
              period === p.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <FunnelView events={events} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <div>
              <h3 className="flex items-center gap-1.5 text-[13px] font-bold text-foreground uppercase tracking-wide mb-3">
                <Globe className="w-4 h-4 text-muted-foreground" />
                Источники (рефереры)
              </h3>
              <div className="rounded-xl border border-border/30 overflow-hidden bg-card/50">
                {referrers.length === 0 ? (
                  <div className="px-4 py-6 text-[12px] text-muted-foreground text-center">Нет данных</div>
                ) : referrers.map(([key, count], i) => (
                  <div key={key} className={`flex items-center justify-between px-4 py-2.5 ${i !== 0 ? 'border-t border-border/20' : ''}`}>
                    <span className="text-[12px] text-foreground truncate pr-3">{key}</span>
                    <span className="text-[12px] font-bold text-foreground shrink-0">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="flex items-center gap-1.5 text-[13px] font-bold text-foreground uppercase tracking-wide mb-3">
                <Tag className="w-4 h-4 text-muted-foreground" />
                UTM-источники
              </h3>
              <div className="rounded-xl border border-border/30 overflow-hidden bg-card/50">
                {utmSources.length === 0 ? (
                  <div className="px-4 py-6 text-[12px] text-muted-foreground text-center">Нет данных</div>
                ) : utmSources.map(([key, count], i) => (
                  <div key={key} className={`flex items-center justify-between px-4 py-2.5 ${i !== 0 ? 'border-t border-border/20' : ''}`}>
                    <span className="text-[12px] text-foreground truncate pr-3">{key}</span>
                    <span className="text-[12px] font-bold text-foreground shrink-0">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}