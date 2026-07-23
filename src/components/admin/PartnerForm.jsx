import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DEFAULT_CONFIG = {
  background: '228 9% 19%',
  primary: '66 100% 40%',
  foreground: '220 14% 93%',
  accent: '228 7% 30%',
};

function ColorField({ label, value, onChange }) {
  return (
    <div>
      <Label className="text-[12px] font-semibold text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2 mt-1">
        <input
          type="color"
          value={hslToHex(value)}
          onChange={(e) => onChange(hexToHsl(e.target.value))}
          className="w-9 h-9 rounded-lg border border-border bg-transparent cursor-pointer shrink-0"
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 font-mono text-[12px]" />
      </div>
    </div>
  );
}

function hslToHex(hslStr) {
  if (!hslStr) return '#000000';
  const parts = hslStr.split(/\s+/);
  if (parts.length < 3) return '#000000';
  const h = parseFloat(parts[0]) / 360;
  const s = parseFloat(parts[1]) / 100;
  const l = parseFloat(parts[2]) / 100;
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = (c) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToHsl(hex) {
  if (!hex) return '';
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export default function PartnerForm({ open, onOpenChange, partner, onSave }) {
  const [form, setForm] = useState(() => {
    const cfg = partner?.widget_config || DEFAULT_CONFIG;
    return {
      name: partner?.name || '',
      company_url: partner?.company_url || '',
      contact_name: partner?.contact_name || '',
      contact_phone: partner?.contact_phone || '',
      widget_id: partner?.widget_id || '',
      status: partner?.status || 'active',
      analytics_enabled: partner?.analytics_enabled !== false,
      logo_url: partner?.logo_url || '',
      widget_config: { ...cfg },
    };
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const updateConfig = (field, value) =>
    setForm((f) => ({ ...f, widget_config: { ...f.widget_config, [field]: value } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.widget_id.trim()) {
      setError('Заполните название и ID виджета');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(form);
      onOpenChange(false);
    } catch (err) {
      setError(err.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[16px] font-bold">
            {partner ? 'Редактировать партнёра' : 'Новый партнёр'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <Label className="text-[12px] font-semibold text-muted-foreground">Название компании</Label>
            <Input value={form.name} onChange={(e) => update('name', e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-[12px] font-semibold text-muted-foreground">Сайт партнёра</Label>
            <Input value={form.company_url} onChange={(e) => update('company_url', e.target.value)} placeholder="https://..." className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[12px] font-semibold text-muted-foreground">Контактное лицо</Label>
              <Input value={form.contact_name} onChange={(e) => update('contact_name', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-[12px] font-semibold text-muted-foreground">Телефон</Label>
              <Input value={form.contact_phone} onChange={(e) => update('contact_phone', e.target.value)} className="mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-[12px] font-semibold text-muted-foreground">ID виджета</Label>
            <Input
              value={form.widget_id}
              onChange={(e) => update('widget_id', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
              placeholder="например: bigms"
              className="mt-1 font-mono"
            />
            <p className="text-[11px] text-muted-foreground mt-1">Используется в URL: ?widget=ID</p>
          </div>
          <div>
            <Label className="text-[12px] font-semibold text-muted-foreground">URL логотипа</Label>
            <Input value={form.logo_url} onChange={(e) => update('logo_url', e.target.value)} placeholder="https://..." className="mt-1" />
          </div>

          <div className="pt-2 border-t border-border/30">
            <div className="text-[13px] font-bold text-foreground mb-3">Настройки оформления</div>
            <div className="grid grid-cols-2 gap-3">
              <ColorField label="Фон" value={form.widget_config.background} onChange={(v) => updateConfig('background', v)} />
              <ColorField label="Кнопки/акценты" value={form.widget_config.primary} onChange={(v) => updateConfig('primary', v)} />
              <ColorField label="Текст/заголовки" value={form.widget_config.foreground} onChange={(v) => updateConfig('foreground', v)} />
              <ColorField label="Акцентный фон" value={form.widget_config.accent} onChange={(v) => updateConfig('accent', v)} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.analytics_enabled}
                onChange={(e) => update('analytics_enabled', e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-[12px] font-semibold text-muted-foreground">Сбор аналитики</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <select
                value={form.status}
                onChange={(e) => update('status', e.target.value)}
                className="text-[12px] bg-card border border-border rounded-lg px-2 py-1.5"
              >
                <option value="active">Активен</option>
                <option value="paused">Приостановлен</option>
              </select>
            </label>
          </div>

          {error && <p className="text-[12px] text-red-500 font-medium">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={saving} className="w-full bg-primary text-primary-foreground">
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}