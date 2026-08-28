import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { RADIATOR_MODELS, CAMBIOTHERM_HEIGHTS, RADIATOR_TYPES } from '@/lib/radiatorData';
import { getMaxSections, getMinSections } from '@/lib/modelLimits';

export function parseSearchQuery(raw) {
  const text = (raw || '').trim();
  if (!text) return { series: null, model: null, sections: null };
  let series = null;
  let model = null;
  let sections = null;

  const lower = text.toLowerCase();
  if (/cambiotherm/.test(lower)) series = 'Cambiotherm';
  else if (/\brrv\b/.test(lower)) series = 'RRV';
  else if (/\brrn\b/.test(lower)) series = 'RRN';

  const modelMatch = text.match(/(\d{4})(\s*v)?/i);
  if (modelMatch) {
    model = modelMatch[1];
    if (modelMatch[2] && /v/i.test(modelMatch[2])) series = series || 'RRV';
  }

  let secMatch = null;
  if (text.includes('/')) {
    secMatch = text.split('/').pop().match(/\d+/);
  } else if (model) {
    const afterModel = text.slice(text.indexOf(model) + model.length);
    secMatch = afterModel.match(/\d+/);
  }
  if (secMatch) sections = parseInt(secMatch[0], 10);

  return { series, model, sections };
}

export default function SearchModal({ open, onOpenChange, onSearch }) {
  const [query, setQuery] = useState('');
  const [series, setSeries] = useState('');
  const [model, setModel] = useState('');
  const [sections, setSections] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setQuery('');
      setSeries('');
      setModel('');
      setSections('');
      setError('');
    }
  }, [open]);

  const handleFind = () => {
    const parsed = parseSearchQuery(query);
    const finalSeries = series || parsed.series;
    const finalModel = (model || '').trim() || parsed.model;
    const finalSections = sections ? parseInt(sections, 10) : parsed.sections;

    if (!finalSeries) { setError('Укажите серию'); return; }
    if (!finalModel) { setError('Укажите модель (4 цифры)'); return; }
    if (!finalSections) { setError('Укажите количество секций'); return; }

    const modelObj = RADIATOR_MODELS.find(m => m.model === finalModel);
    if (!modelObj) { setError(`Модель ${finalModel} не найдена`); return; }

    if (finalSeries === 'Cambiotherm' && !CAMBIOTHERM_HEIGHTS.includes(modelObj.height)) {
      setError('Эта модель недоступна для серии Cambiotherm');
      return;
    }

    const min = getMinSections();
    const max = getMaxSections(finalModel);
    if (finalSections < min || finalSections > max) {
      setError(`Секций должно быть от ${min} до ${max}`);
      return;
    }

    setError('');
    onSearch(finalSeries, modelObj, finalSections);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[420px]"
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleFind(); } }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[15px] font-bold text-foreground">
            <Search className="w-4 h-4 text-primary" />
            Поиск радиатора
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <Label className="text-[12px] font-semibold text-muted-foreground">Артикул или модель</Label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="KERMI - RRN - 2060 / 18"
              className="mt-1 font-mono"
              autoFocus
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Напр. 2055V/12, 2060/18, KERMI - RRV - 3055 / 14
            </p>
          </div>

          <div className="border-t border-border/40" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[12px] font-semibold text-muted-foreground">Серия</Label>
              <Select value={series} onValueChange={setSeries}>
                <SelectTrigger className="mt-1 h-9 text-[13px]">
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  {RADIATOR_TYPES.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[12px] font-semibold text-muted-foreground">Модель</Label>
              <Input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="2060"
                className="mt-1"
                inputMode="numeric"
              />
            </div>
          </div>

          <div>
            <Label className="text-[12px] font-semibold text-muted-foreground">Секций</Label>
            <Input
              value={sections}
              onChange={(e) => setSections(e.target.value.replace(/\D/g, ''))}
              placeholder="18"
              className="mt-1"
              inputMode="numeric"
            />
          </div>

          {error && <p className="text-[12px] text-red-500 font-medium">{error}</p>}

          <Button
            onClick={handleFind}
            className="w-full bg-[#685ef0] hover:bg-[#5848d4] text-white"
          >
            <Search className="w-4 h-4 mr-2" />
            Найти
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}