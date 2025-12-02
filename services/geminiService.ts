import { CaricatureResult } from "../types";

/**
 * Chama o backend Next.js (/api/caricaturas) para processar a imagem.
 * Não chama mais o Google diretamente do front.
 */
export const generateCaricatures = async (file: File): Promise<CaricatureResult[]> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/api/caricaturas', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erro ao conectar com o servidor');
  }

  const data = await response.json();
  return data.caricaturas;
};
