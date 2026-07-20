import React from 'react';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { formatEuro } from '@/lib/radiatorCalc';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export default function ResetConfirmDialog({ open, result, article, totalPrice, onConfirm, onCancel }) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Начать новый подбор?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              {result ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Текущая конфигурация будет сброшена:</p>
                  <div className="p-3 bg-white/5 rounded-xl border border-border/50 space-y-1.5 text-[13px]">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Артикул</span>
                      <code className="font-mono font-bold text-foreground text-[11px]">{article}</code>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Модель</span>
                      <span className="font-medium text-foreground">{result.model}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Секций</span>
                      <span className="font-medium text-foreground">{result.sections}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Длина</span>
                      <span className="font-medium text-foreground">{result.length} мм</span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-border">
                      <span className="font-bold text-foreground">Итого</span>
                      <span className="font-bold text-foreground">{formatEuro(totalPrice)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Все выбранные параметры будут сброшены к начальным значениям.</p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Начать заново
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}