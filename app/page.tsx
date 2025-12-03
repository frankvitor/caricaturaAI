"use client";

import React, { useState } from 'react';
import { UploadArea } from '../components/UploadArea';
import { Button } from '../components/Button';
import { ResultCard } from '../components/ResultCard';
import { ImageModal } from '../components/ImageModal';
import { generateCaricatures } from '../services/geminiService';
import { CaricatureResult, LoadingState } from '../types';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<CaricatureResult[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [error, setError] = useState<string | null>(null);
  
  // State for Image Modal (Lightbox)
  const [selectedImage, setSelectedImage] = useState<CaricatureResult | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setResults([]);
    setLoadingState(LoadingState.IDLE);
  };

  const handleGenerate = async () => {
    if (!file) return;

    setLoadingState(LoadingState.GENERATING);
    setError(null);

    try {
      // Chama o serviço que agora conecta na API Route do Next.js
      const data = await generateCaricatures(file);
      setResults(data);
      setLoadingState(LoadingState.COMPLETE);
      
      setTimeout(() => {
        document.getElementById('results-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    } catch (err: any) {
      console.error(err);
      setError('Ocorreu um erro ao gerar as caricaturas. Tente novamente em instantes.');
      setLoadingState(LoadingState.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFD] selection:bg-fuchsia-200 selection:text-fuchsia-900 font-sans">
      
      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-violet-200/40 rounded-full blur-[120px] mix-blend-multiply opacity-70"></div>
        <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-fuchsia-200/40 rounded-full blur-[100px] mix-blend-multiply opacity-70"></div>
        <div className="absolute bottom-[10%] left-[20%] w-[30%] h-[30%] bg-indigo-200/40 rounded-full blur-[100px] mix-blend-multiply opacity-70"></div>
      </div>

      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white text-xl shadow-lg shadow-violet-500/30">
                🎨
              </div>
              <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
                SublimaSeu<span className="text-violet-600">.Caricaturas</span>
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* Hero & Upload Section */}
        <section className="text-center space-y-10">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
              Transforme fotos em <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600">
                Arte Digital Única
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Carregue uma foto e veja nossa IA criar vários estilos exclusivos!
            </p>
          </div>

          <div className="flex flex-col items-center space-y-8">
            <div className="w-full relative z-10">
               <UploadArea 
                onFileSelect={handleFileSelect} 
                selectedFile={file} 
              />
            </div>
            
            {file && (
              <div className="w-full max-w-xl animate-fade-in-up z-20">
                <Button 
                  onClick={handleGenerate}
                  isLoading={loadingState === LoadingState.GENERATING}
                  fullWidth
                  className="text-lg py-5 shadow-xl shadow-fuchsia-500/40 hover:shadow-fuchsia-500/50"
                >
                  {loadingState === LoadingState.GENERATING ? 'Pintando Obras de Arte...' : 'Gerar 8 Estilos Mágicos ✨'}
                </Button>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl max-w-xl w-full text-center text-sm font-medium animate-pulse">
                {error}
              </div>
            )}
          </div>
        </section>

        {/* Results Section */}
        {results.length > 0 && (
          <section className="space-y-8 animate-fade-in pb-20">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-3xl font-black text-gray-900">Sua Galeria</h3>
                <p className="text-gray-500">Clique nas imagens para ampliar</p>
              </div>
              
              <Button 
                variant="secondary" 
                onClick={() => {
                  setFile(null);
                  setResults([]);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hidden sm:inline-flex"
              >
                Nova Criação
              </Button>
            </div>
            
            {/* Grid de 4 colunas para acomodar 8 estilos */}
            <div id="results-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {results.map((result) => (
                <ResultCard 
                  key={result.id} 
                  result={result} 
                  onExpand={setSelectedImage} 
                />
              ))}
            </div>

            <div className="sm:hidden flex justify-center pt-4">
               <Button 
                  variant="secondary" 
                  onClick={() => {
                    setFile(null);
                    setResults([]);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  fullWidth
                >
                  Nova Criação
                </Button>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white/50 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 font-medium">
            Desenvolvido por SublimaSeu.AI 
          </p>
        </div>
      </footer>

      <ImageModal 
        isOpen={!!selectedImage}
        imageUrl={selectedImage?.imageBase64 || null}
        altText={selectedImage?.styleName || ''}
        onClose={() => setSelectedImage(null)}
      />

    </div>
  );
}
