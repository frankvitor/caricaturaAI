import React, { useCallback, useState } from 'react';

interface UploadAreaProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onFileSelect, selectedFile }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center w-full h-72 rounded-3xl border-3 border-dashed cursor-pointer transition-all duration-300 group overflow-hidden
          ${isDragging 
            ? 'border-fuchsia-500 bg-fuchsia-50 scale-[1.02] shadow-xl shadow-fuchsia-500/20' 
            : 'border-violet-200 bg-white hover:bg-violet-50 hover:border-violet-400 hover:shadow-lg hover:shadow-violet-500/10'
          }
          ${selectedFile ? 'border-emerald-400 bg-emerald-50' : ''}
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 pointer-events-none" />
        
        <div className="relative flex flex-col items-center justify-center pt-5 pb-6 text-center px-4 z-10">
          {selectedFile ? (
            <>
              <div className="w-16 h-16 mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="mb-1 text-lg text-emerald-800 font-bold">
                Imagem Carregada!
              </p>
              <p className="text-sm text-emerald-600 truncate max-w-xs font-medium bg-emerald-100 px-3 py-1 rounded-full">{selectedFile.name}</p>
              <p className="mt-4 text-xs text-emerald-500 uppercase tracking-widest font-bold">Clique para alterar</p>
            </>
          ) : (
            <>
              <div className={`w-20 h-20 mb-4 rounded-full flex items-center justify-center transition-colors duration-300 ${isDragging ? 'bg-fuchsia-100 text-fuchsia-600' : 'bg-violet-100 text-violet-600 group-hover:bg-violet-200 group-hover:scale-110 transform transition-transform'}`}>
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="mb-2 text-lg text-gray-600">
                <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">Clique para enviar</span> ou arraste
              </p>
              <p className="text-sm text-gray-400 font-medium">PNG, JPG ou WEBP</p>
            </>
          )}
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept="image/*"
          onChange={handleInputChange} 
        />
      </label>
    </div>
  );
};