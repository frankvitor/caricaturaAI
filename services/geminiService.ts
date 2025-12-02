import { CaricatureResult } from "../types";

/**
 * Comprime e redimensiona a imagem antes do upload para otimizar performance.
 * Reduz para no máximo 1024px de largura/altura.
 */
const compressImage = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const MAX_SIZE = 1024; // Tamanho suficiente para boa qualidade sem pesar na API
      let width = img.width;
      let height = img.height;

      // Mantém a proporção
      if (width > height) {
        if (width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        // Converte para JPEG com 80% de qualidade
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Falha na compressão da imagem'));
        }, 'image/jpeg', 0.8);
      } else {
        reject(new Error('Falha ao criar contexto do canvas'));
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Falha ao carregar a imagem para processamento'));
    };
  });
};

/**
 * Chama o backend Next.js (/api/caricaturas) para processar a imagem.
 */
export const generateCaricatures = async (file: File): Promise<CaricatureResult[]> => {
  try {
    // 1. Comprimir imagem antes de enviar (Crucial para velocidade e evitar timeouts)
    const compressedBlob = await compressImage(file);
    
    const formData = new FormData();
    // Envia como arquivo 'image'
    formData.append('image', compressedBlob, 'image.jpg');

    // 2. Enviar para a API
    const response = await fetch('/api/caricaturas', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = 'Erro ao conectar com o servidor';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // Ignora erro de parse JSON
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.caricaturas;
    
  } catch (error) {
    console.error("Erro no serviço de caricaturas:", error);
    throw error;
  }
};