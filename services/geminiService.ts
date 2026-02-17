
import { GoogleGenAI, Type } from "@google/genai";
import { Participant, User } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const findCompanyIntel = async (
  name: string, 
  website?: string, 
  sector?: string,
  sender?: User,
  onRetry?: (msg: string) => void
): Promise<Partial<Participant>> => {
  const ai = getAI();
  
  const senderContext = `
BİZİM ŞİRKETİMİZ: ${sender?.companyName || 'DeepVera AI'}
BİZİM ÇÖZÜMÜMÜZ: ${sender?.globalPitch || 'Yapay Zeka Destekli Satış ve İstihbarat'}
TEMSİLCİMİZ: ${sender?.authorizedPerson || sender?.name}
`;

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
      HEDEF ŞİRKET: "${name}" (${website || 'N/A'})
      SEKTÖR: ${sector}
      ${senderContext}

      GÖREV:
      1. Şirketin güncel TELEFON, EMAIL ve SOSYAL MEDYA (LinkedIn, Instagram, Facebook, Twitter) linklerini bul.
      2. Şirketin RAKİPLERİNİ ve ACI NOKTALARINI analiz et.
      3. ULTRA-STRATEJİK bir e-posta yaz.

      E-POSTA YAZIM KURALLARI (HAYATİ):
      - Toplam 3 paragraf olmalı.
      - Her paragraf arasına tam olarak iki adet <br><br> etiketi koy.
      - Paragraf 1: Şirketin son başarılarına veya sosyal medyadaki profesyonel duruşuna atıf yapan şık bir giriş.
      - Paragraf 2: Sektörel bir "acı noktası" tespiti ve bizim çözümümüzün faydası.
      - Paragraf 3: Net bir "müsaitlik" sorusu (CTA).
      - Dil: Akıcı, saygılı, samimi İstanbul Türkçesi.
      `,
      config: { 
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            linkedin: { type: Type.STRING },
            instagram: { type: Type.STRING },
            facebook: { type: Type.STRING },
            twitter: { type: Type.STRING },
            industry: { type: Type.STRING },
            description: { type: Type.STRING },
            starRating: { type: Type.NUMBER },
            competitors: { type: Type.ARRAY, items: { type: Type.STRING } },
            painPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            emailSubject: { type: Type.STRING },
            emailDraft: { type: Type.STRING },
            prestigeNote: { type: Type.STRING }
          }
        }
      },
    });
    return JSON.parse(response.text || '{}');
  }, onRetry);
};

async function callWithRetry<T>(fn: () => Promise<T>, onRetry?: (msg: string) => void, retries = 3, initialDelay = 4000): Promise<T> {
  let currentDelay = initialDelay;
  for (let i = 0; i < retries; i++) {
    try { return await fn(); } catch (error: any) {
      if (i < retries - 1 && (error.status === 429 || error.status >= 500)) {
        if (onRetry) onRetry(`Sistem yoğun, tekrar deneniyor... (${i + 1}/${retries})`);
        await new Promise(r => setTimeout(r, currentDelay));
        currentDelay *= 2; continue;
      }
      throw error;
    }
  }
  throw new Error("Bağlantı sağlanamadı.");
}

export const extractLeadList = async (queryContext: string, sector: string, location: string, limit: number, excludeNames: string[]): Promise<Partial<Participant>[]> => {
  const ai = getAI();
  const isUrl = queryContext.startsWith('http');
  const prompt = isUrl 
    ? `"${queryContext}" sitesindeki katılımcı listesini çıkar. Her firmanın TELEFON ve web sitesini tespit et. Limit: ${limit}.`
    : `"${location}" bölgesindeki "${sector}" sektöründen ${limit} şirket listele. Atla: ${excludeNames.join(", ")}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          leads: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                website: { type: Type.STRING },
                phone: { type: Type.STRING },
                location: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || '{"leads":[]}').leads || [];
};

export const analyzeOwnWebsite = async (url: string): Promise<Partial<User>> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Web sitesini analiz et: ${url}. Şirket adı, faaliyet alanı, değer önerisi çıkar.`,
    config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || '{}');
};
