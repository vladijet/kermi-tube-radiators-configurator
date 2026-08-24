import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, FileSpreadsheet } from 'lucide-react';
import FunnelView, { EVENT_LABELS, PERIODS, computeCounts } from '@/components/admin/FunnelView';

export default function WidgetStats({ partner, onClose }) {
  const [period, setPeriod] = useState('all');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = { partner_id: partner.id };
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
  }, [partner.id, period]);

  const handleExportExcel = () => {
    import('xlsx').then((XLSX) => {
      const counts = computeCounts(events);
      const rows = EVENT_LABELS.map((e) => ({
        'Этап воронки': e.label,
        'Количество': counts[e.type] || 0,
        'Конверсия %': counts.open ? Math.round(((counts[e.type] || 0) / counts.open) * 100) : 0,
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Статистика');
      XLSX.writeFile(wb, `Статистика_${partner.name}_${period}.xlsx`);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 shrink-0">
        <div>
          <h2 className="text-[20px] font-bold text-foreground">Статистика — {partner.name}</h2>
          <p className="text-[12px] text-muted-foreground">Воронка использования виджета</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[12px] font-bold hover:bg-primary/20 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </button>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-6 py-3 flex items-center justify-between border-b border-border/20 shrink-0">
        <div className="flex gap-1.5">
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
        <div className="text-[12px] text-muted-foreground">
          {partner.analytics_enabled !== false ? 'Аналитика включена' : 'Аналитика выключена'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          <FunnelView events={events} />
        )}
      </div>
    </div>
  );
}