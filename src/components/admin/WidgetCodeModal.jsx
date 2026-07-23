import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

export default function WidgetCodeModal({ open, onOpenChange, partner }) {
  const [copied, setCopied] = useState(false);

  if (!partner) return null;

  const widgetUrl = `${window.location.origin}/?widget=${partner.widget_id}`;
  const embedCode = `<iframe
  src="${widgetUrl}"
  width="100%"
  height="800"
  frameborder="0"
  style="border:none; border-radius:12px;"
  allowfullscreen>
</iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-[16px] font-bold">Код вставки — {partner.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="p-3 rounded-lg bg-secondary/50 border border-border/30">
            <div className="text-[11px] font-semibold text-muted-foreground uppercase mb-2">URL виджета</div>
            <code className="text-[12px] text-primary font-mono break-all">{widgetUrl}</code>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-muted-foreground uppercase mb-2">HTML-код для вставки</div>
            <pre className="p-3 rounded-lg bg-secondary/50 border border-border/30 text-[11px] font-mono text-foreground overflow-x-auto whitespace-pre-wrap break-all">
{embedCode}
            </pre>
          </div>
          <Button onClick={handleCopy} className="w-full bg-primary text-primary-foreground">
            {copied ? (
              <><Check className="w-4 h-4 mr-2" /> Скопировано</>
            ) : (
              <><Copy className="w-4 h-4 mr-2" /> Копировать код</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}