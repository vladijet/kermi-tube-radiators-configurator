import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { formatEuro } from '@/lib/radiatorCalc';
import { COLOR_OPTIONS, findConnectionVariant, HIGH_PRESSURE_SURCHARGE } from '@/lib/radiatorData';
import { MapPin, Building2, User, Phone, Mail, Loader2, Send, Check } from 'lucide-react';

export default function Step4Order({ article, result, totalPrice, config }) {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [city, setCity] = useState('');
  const [dealerId, setDealerId] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  useEffect(() => {
    base44.entities.Dealer.list()
      .then(setDealers)
      .catch(() => setDealers([]))
      .finally(() => setLoading(false));
  }, []);

  const cities = [...new Set(dealers.map(d => d.city))].sort();
  const cityDealers = dealers.filter(d => !city || d.city === city);
  const selectedDealer = dealers.find(d => d.id === dealerId);
  const color = COLOR_OPTIONS.find(c => c.code === config.colorCode);
  const variant = findConnectionVariant(config.connGroup, config.connCode);

  const handleSubmit = async () => {
    if (!contactName || !contactPhone || !dealerId) return;
    setSubmitting(true);
    try {
      await base44.entities.Order.create({
        article,
        model: result.model,
        sections: result.sections,
        radiator_config: { ...result, ...config, totalPrice },
        dealer_id: dealerId,
        dealer_name: selectedDealer?.name || '',
        dealer_city: selectedDealer?.city || '',
        contact_name: contactName,
        contact_phone: contactPhone,
        contact_email: contactEmail,
        total_price: totalPrice,
        status: 'new',
      });
      setDone(true);
    } catch (e) {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6">
        <div className="w-16 h-16 rounded-full bg-[#BFCE00] flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-bold text-[#333] mb-1">Заявка отправлена!</h3>
        <p className="text-sm text-gray-500 text-center">Дилер «{selectedDealer?.name}» свяжется с вами в ближайшее время.</p>
      </div>
    );
  }

  const inputClass = "w-full px-3.5 py-2.5 text-[14px] font-medium text-[#333] bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#BFCE00] focus:ring-2 focus:ring-[#BFCE00]/20 transition-all";
  const labelClass = "flex items-center gap-1.5 text-[13px] font-semibold text-gray-600 mb-1.5";

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Артикул</div>
        <code className="block px-3 py-2 bg-white border border-gray-200 rounded-lg text-[14px] font-bold text-[#333] font-mono break-all mb-3">{article}</code>
        <div className="space-y-1.5 text-[13px]">
          <div className="flex justify-between text-gray-500">
            <span>Модель {result.model}, {result.sections} секц., {result.length} мм</span>
            <span className="font-medium text-[#333]">{formatEuro(result.basePrice)}</span>
          </div>
          {color && color.surcharge_percent > 0 && (
            <div className="flex justify-between text-gray-500">
              <span>Цвет: {color.short} (+{color.surcharge_percent}%)</span>
              <span className="font-medium text-[#333]">+{formatEuro(result.basePrice * (color.surcharge_percent / 100))}</span>
            </div>
          )}
          {variant && variant.surcharge > 0 && (
            <div className="flex justify-between text-gray-500">
              <span>Подключение: {variant.code}{variant.valveType ? ` ${variant.valveType}` : ''}</span>
              <span className="font-medium text-[#333]">+{formatEuro(variant.surcharge)}</span>
            </div>
          )}
          {config.highPressure && (
            <div className="flex justify-between text-gray-500">
              <span>Давление 16 атм</span>
              <span className="font-medium text-[#333]">+{formatEuro(HIGH_PRESSURE_SURCHARGE)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-gray-200">
            <span className="font-bold text-[#333]">Итого с НДС</span>
            <span className="text-[18px] font-bold text-[#333]">{formatEuro(totalPrice)}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-gray-300 animate-spin" /></div>
      ) : (
        <>
          <div>
            <label className={labelClass}><MapPin className="w-3.5 h-3.5 text-[#BFCE00]" /> Город</label>
            <select value={city} onChange={e => { setCity(e.target.value); setDealerId(''); }} className={inputClass}>
              <option value="">Все города</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}><Building2 className="w-3.5 h-3.5 text-[#BFCE00]" /> Дилер</label>
            <select value={dealerId} onChange={e => setDealerId(e.target.value)} className={inputClass}>
              <option value="">Выберите дилера</option>
              {cityDealers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            {selectedDealer && (
              <div className="text-[12px] text-gray-400 px-1 mt-1">{selectedDealer.phone}{selectedDealer.email ? ` · ${selectedDealer.email}` : ''}</div>
            )}
          </div>
          <div>
            <label className={labelClass}><User className="w-3.5 h-3.5 text-[#BFCE00]" /> Ваше имя</label>
            <input value={contactName} onChange={e => setContactName(e.target.value)} className={inputClass} placeholder="Иван Иванов" />
          </div>
          <div>
            <label className={labelClass}><Phone className="w-3.5 h-3.5 text-[#BFCE00]" /> Телефон</label>
            <input value={contactPhone} onChange={e => setContactPhone(e.target.value)} className={inputClass} placeholder="+7 (___) ___-__-__" />
          </div>
          <div>
            <label className={labelClass}><Mail className="w-3.5 h-3.5 text-[#BFCE00]" /> Email (необязательно)</label>
            <input value={contactEmail} onChange={e => setContactEmail(e.target.value)} className={inputClass} placeholder="email@example.com" />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!contactName || !contactPhone || !dealerId || submitting}
            className="flex items-center justify-center gap-2 w-full py-3 bg-[#BFCE00] hover:bg-[#a8b800] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-[14px] transition-colors"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Отправить заявку
          </button>
        </>
      )}
    </div>
  );
}