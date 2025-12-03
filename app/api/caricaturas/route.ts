import { GoogleGenAI } from "@google/genai";
import { NextResponse } from 'next/server';
import { CARICATURE_STYLES } from "../../../constants";
import { Buffer } from "buffer";

// Tenta configurar duração máxima de 60s (Funciona no plano Pro, e em alguns casos no Hobby dependendo da região)
export const maxDuration = 60;

// Inicializa a API do Google (Server Side)
// Tenta ler GEMINI_API_KEY (solicitado) ou API_KEY (padrão do SDK)
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

if (!apiKey) {
  console.error("ERRO: Nenhuma API Key encontrada. Configure GEMINI_API_KEY nas variáveis de ambiente da Vercel.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

// Função auxiliar para gerar um estilo
async function generateSingleStyle(base64Image: string, mimeType: string, style: any) {
  try {
    // Adiciona instruções para garantir que o modelo retorne uma imagem e não texto
    const prompt = `${style.prompt}. IMPORTANT: Return ONLY the generated image. Do not describe it.`;

    const response = await ai.models.generateContent({
      //model: 'gemini-2.5-flash-image', // Modelo rápido e capaz de edição de imagem
      model: 'gemini-2.5-flash', 
      //model: 'gemini-1.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          {
            text: prompt
          }
        ]
      },
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        // Verifica se há dados de imagem na resposta
        if (part.inlineData && part.inlineData.data) {
          return {
            id: style.id,
            styleName: style.name,
            imageBase64: `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`
          };
        }
      }
    }
    console.warn(`Aviso: O estilo ${style.name} não retornou dados de imagem.`);
    return null;
  } catch (error) {
    console.error(`Erro ao gerar estilo ${style.name}:`, error);
    return null; // Retorna null em caso de falha para não quebrar o Promise.all
  }
}

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json({ error: 'Configuração de API Key ausente no servidor.' }, { status: 500 });
    }

    // 1. Ler o FormData
    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhuma imagem fornecida' }, { status: 400 });
    }

    // 2. Converter File para Base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const mimeType = file.type || 'image/png';

    console.log(`Iniciando geração de ${CARICATURE_STYLES.length} estilos...`);

    // 3. Gerar estilos em paralelo
    // Usamos o modelo Flash que é mais rápido. 
    // Se houver timeout na Vercel, considere reduzir a quantidade de estilos ou fazer em batches.
    const promises = CARICATURE_STYLES.map(style => 
      generateSingleStyle(base64Image, mimeType, style)
    );

    const results = await Promise.all(promises);
    
    // Filtra falhas (nulls)
    const successfulCaricatures = results.filter(r => r !== null);

    if (successfulCaricatures.length === 0) {
      console.error("Falha: Nenhum estilo foi gerado com sucesso.");
      return NextResponse.json({ error: 'Não foi possível gerar as caricaturas. Tente novamente com uma foto diferente.' }, { status: 500 });
    }

    return NextResponse.json({ caricaturas: successfulCaricatures });

  } catch (error: any) {
    console.error('Erro CRÍTICO na API Route:', error);
    return NextResponse.json({ error: `Erro interno: ${error.message}` }, { status: 500 });
  }
}
