import React from 'react';
import { Check, RotateCcw } from 'lucide-react';

const STEPS = [
  { num: 1, label: 'Модель и подключение' },
  { num: 2, label: 'Мощность и размеры' },
  { num: 3, label: 'Результаты и комплектация' },
  { num: 4, label: 'Заказ' },
];

export default function StepIndicator({ currentStep, onStepClick, onReset }) {
  return (
    <div className="relative flex items-center justify-center gap-1 sm:gap-2 px-4 py-3 bg-white border-b border-gray-100">
      {onReset && (
        <button
          onClick={onReset}
          className="absolute left-4 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold text-gray-500 hover:text-[#333] hover:bg-gray-100 transition-all z-10"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Новый подбор</span>
        </button>
      )}
      {STEPS.map((step, idx) => (
        <React.Fragment key={step.num}>
          <button
            onClick={() => onStepClick && onStepClick(step.num)}
            disabled={step.num > currentStep}
            className="flex items-center gap-2 group"
          >
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-[12px] font-bold transition-all ${
              currentStep > step.num
                ? 'bg-[#BFCE00] text-white'
                : currentStep === step.num
                ? 'bg-[#BFCE00] text-white ring-4 ring-[#BFCE00]/20'
                : 'bg-gray-100 text-gray-400'
            }`}>
              {currentStep > step.num ? <Check className="w-3.5 h-3.5" /> : step.num}
            </div>
            <span className={`text-[12px] font-semibold hidden sm:inline ${
              currentStep >= step.num ? 'text-[#333]' : 'text-gray-400'
            }`}>
              {step.label}
            </span>
          </button>
          {idx < STEPS.length - 1 && (
            <div className={`h-0.5 w-4 sm:w-10 rounded-full ${
              currentStep > step.num ? 'bg-[#BFCE00]' : 'bg-gray-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}