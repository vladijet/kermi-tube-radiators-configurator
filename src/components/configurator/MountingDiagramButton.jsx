import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import { buildMountingDiagram, buildDiagramConfig } from '@/lib/buildMountingDiagram';

function sanitizeFilename(article) {
  const base = String(article || 'radiator').replace(/[\\/:*?"<>|/]+/g, '_').trim();
  return `Монтажная схема ${base || 'radiator'}.pdf`;
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).replace(/^data:.*;base64,/, ''));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function base64ToBlob(b64, type) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type });
}

export default function MountingDiagramButton({ config }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const cfg = buildDiagramConfig(config);
      const pngBlob = await buildMountingDiagram(cfg);
      const pngB64 = await blobToBase64(pngBlob);
      const res = await base44.functions.invoke('generateMountingDiagramPdf', { png: pngB64 });
      const pdfB64 = res?.data?.pdf;
      if (!pdfB64) throw new Error('PDF не получен');
      const pdfBlob = base64ToBlob(pdfB64, 'application/pdf');
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = sanitizeFilename(config.article);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err) {
      toast({ title: 'Ошибка генерации PDF', description: err?.message || 'Попробуйте ещё раз', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading || !config}
      className="flex items-center gap-2 px-3 py-2 rounded-premium bg-[#c5e315] text-white text-[12px] font-bold hover:bg-[#b3d414] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      title="Скачать схему монтажа (PDF)"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      {loading ? 'Генерация…' : 'Схема монтажа'}
    </button>
  );
}