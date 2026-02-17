
import { GoogleGenAI, Type } from "@google/genai";
import { Participant, User } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function callWithRetry<T>(
  fn: () => Promise<T>, 
  onRetry?: (msg: string) => void,
  retries = 3, 
  initialDelay = 4000
): Promise<T> {
  let currentDelay = initialDelay;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRetryable = error.status === 429 || error.status === 503 || error.status === 500;
      if (i < retries - 1 && isRetryable) {
        if (onRetry) onRetry(`Sistem meşgul, tekrar deneniyor... (${i + 1}/${retries})`);
        await sleep(currentDelay);
        currentDelay *= 2;
        continue;
      }
      throw error;
    }
  }
  throw new Error("Bağlantı sağlanamadı.");
}

// Fix: Implemented analyzeOwnWebsite to extract company data from a URL using Gemini API
export const analyzeOwnWebsite = async (url: string): Promise<Partial<User>> => {
  const ai = getAI();
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Şu web sitesini analiz et ve şirket bilgilerini çıkar: ${url}. 
      Şirketin adını (companyName), ana faaliyet alanını (mainActivity), hedef kitlesini (targetAudience), 
      global asansör cümlesini (globalPitch) ve resmi adresini (officialAddress) belirle.
      Lütfen yanıtı Türkçe olarak ver.`,
      config: { 
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            companyName: { type: Type.STRING },
            mainActivity: { type: Type.STRING },
            targetAudience: { type: Type.STRING },
            globalPitch: { type: Type.STRING },
            officialAddress: { type: Type.STRING }
          }
        }
      },
    });
    return JSON.parse(response.text || '{}');
  });
};

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
BİZİM ÇÖZÜMÜMÜZ: ${sender?.globalPitch || sender?.mainActivity || 'Yapay Zeka Destekli Satış İstihbaratı'}
HEDEFİMİZ: Belirlenen sektördeki şirketlere değer katmak.
`;

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
      HEDEF ŞİRKET: "${name}" (${website || 'N/A'})
      SEKTÖR: ${sector}
      ${senderContext}

      GÖREV:
      1. Şirketin güncel TELEFON NUMARASINI bul. Bu en kritik önceliktir.
      2. Şirketin prestijini (1-5 yıldız) Google yorumları ve web sitesi kalitesine göre belirle.
      3. TAMAMEN DOĞAL, İNSAN YAZIMI GİBİ BİR E-POSTA TASLAĞI oluştur.

      E-POSTA YAZIM KURALLARI (ÇOK ÖNEMLİ):
      - KESİNLİKLE madde işaretleri, "Giriş:", "Konu:" gibi robotik başlıklar KULLANMA.
      - Metin, 2 veya 3 akıcı paragraftan oluşmalı. 
      - İlk paragrafta onlara neden ulaştığınızı (sektörel başarıları, web siteleri veya güncel haberleri) samimi bir dille belirtin.
      - İkinci paragrafta sunduğunuz değeri ("Biz DeepVera olarak...") birbirine bağlı cümlelerle anlatın.
      - Son bölümde bir tanışma randevusu veya telefon görüşmesi talep edin.
      - Hitap: "Sayın <b>[Firma Adı]</b> Yetkilisi,"
      - Dil: Kurumsal, kibar ve akıcı bir İstanbul Türkçesi.
      - Paragrafları <br><br> ile ayır.
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
            twitter: { type: Type.STRING },
            icebreaker: { type: Type.STRING },
            emailSubject: { type: Type.STRING },
            emailDraft: { type: Type.STRING },
            industry: { type: Type.STRING },
            description: { type: Type.STRING },
            healthScore: { type: Type.NUMBER },
            starRating: { type: Type.NUMBER },
            reviewCount: { type: Type.NUMBER },
            prestigeNote: { type: Type.STRING },
            isVerified: { type: Type.BOOLEAN },
            newsTrigger: { type: Type.STRING }
          }
        }
      },
    });
    return JSON.parse(response.text || '{}');
  }, onRetry);
};

export const extractLeadList = async (
  queryContext: string, 
  sector: string, 
  location: string,
  limit: number,
  excludeNames: string[],
  onRetry?: (msg: string) => void
): Promise<Partial<Participant>[]> => {
  const ai = getAI();
  const isUrl = queryContext.startsWith('http');

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: isUrl 
        ? `"${queryContext}" sitesindeki katılımcı listesini çıkar. Her firmanın TELEFON numarasını mutlaka tespit et. Limit: ${limit}.`
        : `"${location}" bölgesindeki "${sector}" sektöründen ${limit} şirket listele. Şirketlerin telefon numaralarını mutlaka bul. Atla: ${excludeNames.slice(-10).join(", ")}`,
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
                },
                required: ["name"]
              }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || '{"leads":[]}');
    return data.leads || [];
  }, onRetry);
};
