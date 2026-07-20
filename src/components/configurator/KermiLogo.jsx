import React from 'react';

export default function KermiLogo() {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#BFCE00]">
        <span className="text-white font-bold text-lg tracking-tight">K</span>
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-[19px] font-bold tracking-tight text-[#333]">Kermi</span>
        <span className="text-[10px] font-medium text-gray-400 tracking-wide uppercase">Трубчатые радиаторы</span>
      </div>
    </div>
  );
}