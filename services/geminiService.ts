
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants.ts';

/**
 * Engenheiro Sênior: Refatoração para produção.
 * Seguindo as diretrizes de segurança e as instruções do sistema.
 */
// Em ambientes Vite/Vercel, a chave pode estar em process.env (Node) ou import.meta.env (Client)
const apiKey = process.env.API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;

// Log de depuração solicitado para confirmar a leitura da chave no Vercel
console.log(`Iniciando chamada com a chave: ${apiKey ? apiKey.substring(0, 4) + '****' : 'não encontrada (Chave não detectada pelo sistema)'}`);

export const sendMessageToGemini = async (message: string, base64Image?: string): Promise<string> => {
  if (!apiKey) {
    return "🔴 ERRO: Chave não detectada pelo sistema. Verifique as variáveis de ambiente (API_KEY ou VITE_GEMINI_API_KEY) no painel da Vercel.";
  }

  try {
    // Inicializamos a SDK oficial do Google GenAI
    const ai = new GoogleGenAI({ apiKey });

    const parts: any[] = [];
    if (base64Image) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image,
        },
      });
    }
    
    parts.push({ text: message || "Identifique este item e sugira o equivalente Camozzi." });

    /**
     * Utilizamos o modelo gemini-3-flash-preview.
     * Nota técnica: O modelo 1.5-flash foi descontinuado em favor da série 3/2.5 conforme as diretrizes.
     */
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1,
      },
    });

    const text = response.text;
    if (!text) {
        throw new Error("O servidor retornou uma resposta vazia.");
    }
    return text;
  } catch (error: any) {
    console.error("Gemini API Error Detail:", error);
    
    // Tratamento de erros específicos de rede/CORS ou Autenticação
    if (error.message?.includes("API key not valid")) {
        return "🔴 ERRO: Chave API inválida. Verifique se a chave no painel da Vercel está correta.";
    }
    
    if (error.message?.includes("fetch")) {
        return "🔴 ERRO DE REDE: Não foi possível alcançar os servidores do Google. Verifique sua conexão ou configurações de CORS.";
    }
    
    return `🔴 ERRO TÉCNICO: Falha na comunicação com o servidor de Engenharia. (${error.message || 'Erro desconhecido'})`;
  }
};
