import { GoogleGenAI } from "@google/genai";
import { NextResponse } from 'next/server';
import { CARICATURE_STYLES } from "../../../constants";
import { Buffer } from "buffer";

// Inicializa a API do Google (Server Side)
// A variável process.env.API_KEY deve estar definida na Vercel
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Função auxiliar para gerar um estilo
async function generateSingleStyle(base64Image: string, mimeType: string, style: any) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          {
            text: style.prompt
          }
        ]
      },
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return {
            id: style.id,
            styleName: style.name,
            imageBase64: `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`
          };
        }
      }
    }
    return null;
  } catch (error) {
    console.error(`Erro ao gerar estilo ${style.name}:`, error);
    return null; // Retorna null em caso de falha para não quebrar tudo
  }
}

export async function POST(req: Request) {
  try {
    // 1. Ler o FormData
    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhuma imagem fornecida' }, { status: 400 });
    }

    // 2. Converter File para Base64 (ArrayBuffer -> Buffer -> Base64)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const mimeType = file.type || 'image/png';

    // 3. Gerar todos os estilos em paralelo
    // A API do Google tem limites de rate limit, mas o gemini-2.5-flash costuma aguentar bem.
    // Se falhar muito, pode ser necessário fazer em lotes (ex: 2 em 2).
    const promises = CARICATURE_STYLES.map(style => 
      generateSingleStyle(base64Image, mimeType, style)
    );

    const results = await Promise.all(promises);
    
    // Filtra falhas (nulls)
    const successfulCaricatures = results.filter(r => r !== null);

    if (successfulCaricatures.length === 0) {
      return NextResponse.json({ error: 'Falha ao gerar caricaturas' }, { status: 500 });
    }

    return NextResponse.json({ caricaturas: successfulCaricatures });

  } catch (error: any) {
    console.error('Erro na API Route:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}