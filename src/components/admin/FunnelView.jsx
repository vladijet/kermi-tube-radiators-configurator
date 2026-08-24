import React, { useMemo } from 'react';
import { Eye, Sparkles, ShoppingCart, Send, FileSpreadsheet, TrendingUp } from 'lucide-react';

export const EVENT_LABELS = [
  { type: 'open', label: 'Открытия', icon: Eye, color: 'text-blue-400' },
  { type: 'calculation', label: 'Подобрали варианты', icon: Sparkles, color: 'text-green-400' },
  { type: 'order_added', label: 'Добавили в заказ', icon: ShoppingCart, color: 'text-yellow-400' },
  { type: 'application_sent', label: 'Отправили заявку', icon: Send, color: 'text-purple-400' },
  { type: 'excel_download', label: 'Скачали бланк', icon: FileSpreadsheet, color: 'text-orange-400' },
];

export const PERIODS = [
  { key: 'today', label: 'Сегодня', days: 0 },
  { key: 'week', label: 'Неделя', days: 7 },
  { key: 'month', label: 'Месяц', days: 30 },
  { key: 'all', label: 'Всё время', days: null },
];

export function computeCounts(events) {
  const map = {};
  EVENT_LABELS.forEach((e) => { map[e.type] = 0; });
  events.forEach((e) => {
    if (map[e.event_type] !== undefined) map[e.event_type]++;
  });
  return map;
}

export default function FunnelView({ events }) {
  const counts = useMemo(() => computeCounts(events), [events]);
  const maxCount = counts.open || 1;

  return (
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

      <div className="mt-6">
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
                    {count > 0 && <TrendingUp className="w-3.5 h-3.5 text-primary-foreground/70" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}