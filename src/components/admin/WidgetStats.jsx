import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Eye, Sparkles, ShoppingCart, Send, FileSpreadsheet, TrendingUp } from 'lucide-react';

const EVENT_LABELS = [
  { type: 'open', label: 'Открытия', icon: Eye, color: 'text-blue-400' },
  { type: 'calculation', label: 'Подобрали варианты', icon: Sparkles, color: 'text-green-400' },
  { type: 'order_added', label: 'Добавили в заказ', icon: ShoppingCart, color: 'text-yellow-400' },
  { type: 'application_sent', label: 'Отправили заявку', icon: Send, color: 'text-purple-400' },
  { type: 'excel_download', label: 'Скачали бланк', icon: FileSpreadsheet, color: 'text-orange-400' },
];

const PERIODS = [
  { key: 'today', label: 'Сегодня', days: 0 },
  { key: 'week', label: 'Неделя', days: 7 },
  { key: 'month', label: 'Месяц', days: 30 },
  { key: 'all', label: 'Всё время', days: null },
];

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

  const counts = useMemo(() => {
    const map = {};
    EVENT_LABELS.forEach((e) => { map[e.type] = 0; });
    events.forEach((e) => {
      if (map[e.event_type] !== undefined) map[e.event_type]++;
    });
    return map;
  }, [events]);

  const maxCount = counts.open || 1;

  const handleExportExcel = () => {
    import('xlsx').then((XLSX) => {
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

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {EVENT_LABELS.map((e) => {
                const Icon = e.icon;
                return (
                  <div key={e.type} className="p-4 rounded-xl bg-secondary/50 border border-border/30">
                    <Icon className={`w-5 h-5 mb-2 ${e.color}`} />
                    <div className="text-[28px] font-bold text-foreground leading-none">{counts[e.type] || 0}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">{e.label}</div>
                  </div>
                );
              })}
            </div>

            <div>
              <h3 className="text-[13px] font-bold text-foreground uppercase tracking-wide mb-4">Конверсия воронки</h3>
              <div className="space-y-4">
                {EVENT_LABELS.map((e, idx) => {
                  const count = counts[e.type] || 0;
                  const pct = counts.open ? Math.round((count / counts.open) * 100) : 0;
                  const width = Math.max((count / maxCount) * 100, count > 0 ? 8 : 0);
                  const barColor = idx === 0 ? 'bg-muted-foreground/40' : 'bg-primary';
                  return (
                    <div key={e.type}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[13px] font-semibold text-foreground">{e.label}</span>
                        <span className="text-[13px] font-bold text-foreground">
                          {count} <span className="text-muted-foreground font-normal ml-1">{pct}%</span>
                        </span>
                      </div>
                      <div className="h-7 rounded-lg bg-secondary/40 overflow-hidden">
                        <div
                          className={`h-full ${barColor} rounded-lg transition-all duration-500 flex items-center justify-end px-2`}
                          style={{ width: `${width}%` }}
                        >
                          {count > 0 && (
                            <TrendingUp className="w-3.5 h-3.5 text-primary-foreground/70" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}