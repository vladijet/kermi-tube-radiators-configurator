import React from 'react';
import { Pencil, BarChart3, Code2, Trash2 } from 'lucide-react';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function PartnerTable({ partners, onStats, onCode, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/30 text-left">
            <th className="px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Компания</th>
            <th className="px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Сайт</th>
            <th className="px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Контакт</th>
            <th className="px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Создан</th>
            <th className="px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Статус</th>
            <th className="px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Аналитика</th>
            <th className="px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wide text-right">Действия</th>
          </tr>
        </thead>
        <tbody>
          {partners.map((p) => (
            <tr key={p.id} className="border-b border-border/20 hover:bg-secondary/30 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {p.logo_url && (
                    <img src={p.logo_url} alt="" className="w-6 h-6 rounded object-cover shrink-0" />
                  )}
                  <span className="text-[13px] font-bold text-foreground">{p.name}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                {p.company_url ? (
                  <a href={p.company_url} target="_blank" rel="noopener noreferrer" className="text-[12px] text-primary hover:underline truncate block max-w-[180px]">
                    {p.company_url}
                  </a>
                ) : '—'}
              </td>
              <td className="px-4 py-3">
                {p.contact_name ? (
                  <div className="text-[12px]">
                    <div className="font-semibold text-foreground">{p.contact_name}</div>
                    {p.contact_phone && <div className="text-muted-foreground">{p.contact_phone}</div>}
                  </div>
                ) : '—'}
              </td>
              <td className="px-4 py-3 text-[12px] text-muted-foreground">{formatDate(p.created_date)}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  p.status === 'active'
                    ? 'bg-green-500/15 text-green-400'
                    : 'bg-yellow-500/15 text-yellow-400'
                }`}>
                  {p.status === 'active' ? 'Активен' : 'Приостановлен'}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  p.analytics_enabled !== false
                    ? 'bg-secondary text-foreground'
                    : 'bg-secondary text-muted-foreground'
                }`}>
                  {p.analytics_enabled !== false ? 'Вкл' : 'Выкл'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => onStats(p)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-[11px] font-bold hover:bg-primary/20 transition-all"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    Статистика
                  </button>
                  <button
                    onClick={() => onCode(p)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary text-muted-foreground text-[11px] font-bold hover:text-foreground transition-all"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    Код
                  </button>
                  <button
                    onClick={() => onEdit(p)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(p)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}