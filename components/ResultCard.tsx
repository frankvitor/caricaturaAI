import React from 'react';
import { CaricatureResult } from '../types';
import { Button } from './Button';

interface ResultCardProps {
  result: CaricatureResult;
  onExpand: (result: CaricatureResult) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, onExpand }) => {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = result.imageBase64;
    link.download = `caricatura-${result.styleName.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300 border border-gray-100 group relative cursor-zoom-in"
      onClick={() => onExpand(result)}
    >
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <img 
          src={result.imageBase64} 
          alt={`Caricatura estilo ${result.styleName}`} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Overlay com ícone de zoom */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
        </div>

        {/* Badge do estilo */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-white/90 backdrop-blur text-xs font-bold text-violet-700 rounded-full shadow-sm uppercase tracking-wide">
            {result.styleName}
          </span>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow bg-gradient-to-b from-white to-gray-50">
        <div className="flex-grow">
           {/* Espaço reservado para descrição se necessário futuramente */}
        </div>
        
        <Button
          variant="download"
          onClick={handleDownload}
          className="w-full"
        >
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Baixar
        </Button>
      </div>
    </div>
  );
};