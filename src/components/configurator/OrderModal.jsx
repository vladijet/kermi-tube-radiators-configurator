import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatEuro } from '@/lib/radiatorCalc';

export default function OrderModal({ open, onOpenChange, article, result, totalPrice, quantity, setQuantity, config }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Заполните имя и телефон');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await base44.entities.Order.create({
        article,
        model: result?.model || '',
        sections: result?.sections || 0,
        radiator_config: { ...config, quantity, height: result?.height, tubes: result?.tubes, length: result?.length },
        contact_name: name.trim(),
        contact_phone: phone.trim(),
        contact_email: email.trim(),
        total_price: totalPrice * quantity,
        status: 'new',
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Ошибка при отправке заявки');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitted) {
      setSubmitted(false);
      setName(''); setPhone(''); setEmail('');
    }
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-[420px]">
        {submitted ? (
          <div className="py-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-[15px] font-bold text-foreground mb-1">Заявка отправлена</h3>
            <p className="text-[12px] text-muted-foreground">Мы свяжемся с вами в ближайшее время</p>
            <Button onClick={handleClose} className="mt-4 w-full bg-foreground hover:bg-foreground/90 text-background">Закрыть</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-[15px] font-bold text-foreground">Оформление заказа</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-3">
              <div className="p-3 bg-white/5 rounded-lg text-[12px] text-muted-foreground">
                <div className="font-semibold text-foreground mb-0.5 break-all">{article}</div>
                <div>{quantity} шт. · {formatEuro(totalPrice * quantity)}</div>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-[12px] font-semibold text-muted-foreground">Количество</Label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg border border-border text-muted-foreground hover:bg-white/5 font-bold transition-all"
                  >−</button>
                  <input
                    type="number"
                    value={quantity}
                    min={1}
                    onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 h-8 text-center text-[14px] font-bold text-foreground bg-card border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg border border-border text-muted-foreground hover:bg-white/5 font-bold transition-all"
                  >+</button>
                  <span className="text-[11px] text-muted-foreground ml-1">шт</span>
                </div>
              </div>
              <div>
                <Label className="text-[12px] font-semibold text-muted-foreground">Ваше имя</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Иван" className="mt-1" />
              </div>
              <div>
                <Label className="text-[12px] font-semibold text-muted-foreground">Ваш телефон</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7..." className="mt-1" />
              </div>
              <div>
                <Label className="text-[12px] font-semibold text-muted-foreground">Ваш емайл</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" className="mt-1" />
              </div>
              {error && <p className="text-[12px] text-red-500 font-medium">{error}</p>}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submitting} className="w-full bg-[#685ef0] hover:bg-[#5848d4] text-white">
                {submitting ? 'Отправка...' : 'Отправить'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}