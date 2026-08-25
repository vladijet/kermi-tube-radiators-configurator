import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Save, Loader2, Mail } from 'lucide-react';

export default function Settings() {
  const [email, setEmail] = useState('');
  const [recordId, setRecordId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.entities.AppSettings.list('-created_date', 1)
      .then((res) => {
        if (res && res[0]) {
          setRecordId(res[0].id);
          setEmail(res[0].order_notification_email || '');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      if (recordId) {
        await base44.entities.AppSettings.update(recordId, { order_notification_email: email.trim() });
      } else {
        const created = await base44.entities.AppSettings.create({ order_notification_email: email.trim() });
        setRecordId(created.id);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-[18px] font-bold text-foreground mb-1">Настройки</h2>
      <p className="text-[12px] text-muted-foreground mb-6">Уведомления и общие параметры приложения</p>

      <div className="max-w-[480px] rounded-xl border border-border/30 bg-card/50 p-5">
        <label className="flex items-center gap-1.5 text-[13px] font-bold text-foreground mb-2">
          <Mail className="w-4 h-4 text-primary" />
          Email для уведомлений о заказах
        </label>
        <p className="text-[12px] text-muted-foreground mb-3">На этот адрес приходят письма при каждом новом заказе с сайта</p>
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-[12px]">
            <Loader2 className="w-4 h-4 animate-spin" /> Загрузка...
          </div>
        ) : (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="orders@example.com"
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-[13px] text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-3 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-[13px] font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saved ? 'Сохранено!' : 'Сохранить'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}