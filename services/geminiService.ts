
import { GoogleGenAI, Type } from "@google/genai";
import { Participant, User } from "../types";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY_MISSING: Sistem yapılandırması eksik. Lütfen Vercel panelinden API_KEY değişkenini kontrol edin.");
  }
  return new GoogleGenAI({ apiKey });
};

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
      console.error("Gemini API Error:", error);
      const isRetryable = error.status === 429 || error.status === 503 || error.status === 500;
      if (i < retries - 1 && isRetryable) {
        if (onRetry) onRetry(`Bağlantı darboğazı, tünel yenileniyor... (${i + 1}/${retries})`);
        await sleep(currentDelay);
        currentDelay *= 2;
        continue;
      }
      throw error;
    }
  }
  throw new Error("Sistem yanıt vermiyor. Lütfen daha sonra tekrar deneyin.");
}

export const extractLeadList = async (
  queryContext: string, 
  sector: string, 
  location: string,
  limit: number,
  excludeNames: string[],
  onRetry?: (msg: string) => void
): Promise<Partial<Participant>[]> => {
  const ai = getAI();
  const isUrl = queryContext.startsWith('http') || queryContext.includes('.com') || queryContext.includes('.org');

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: isUrl 
        ? `GÖREV: Şu web sitesini analiz et: "${queryContext}". 
           Bu sayfadaki tüm katılımcı (exhibitor) veya üye şirket isimlerini bul.
           Eğer sayfa doğrudan liste içermiyorsa, Google Search kullanarak bu etkinliğin katılımcılarını bul ve listeyi tamamla.
           Sadece şirket ismi, varsa web sitesi ve lokasyon verisini döndür.
           JSON formatında döndür.`
        : `GÖREV: "${location}" bölgesindeki "${sector}" sektöründe faaliyet gösteren ${limit} adet aktif ve büyük ölçekli şirket bul. 
           Lütfen şu şirketleri atla (mevcut listede var): ${excludeNames.slice(-10).join(", ")}.
           EK BİLGİ: ${queryContext}`,
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
                  location: { type: Type.STRING }
                },
                required: ["name"]
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    try {
      const data = JSON.parse(text);
      return data.leads || [];
    } catch (e) {
      console.error("JSON Ayrıştırma Hatası:", text);
      return [];
    }
  }, onRetry);
};

export const findCompanyIntel = async (
  name: string, 
  website?: string, 
  sector?: string,
  sender?: Partial<User>,
  onRetry?: (msg: string) => void
): Promise<Partial<Participant>> => {
  const ai = getAI();
  const senderContext = `GÖNDERİCİ: ${sender?.companyName || 'DeepVera AI'} (${sender?.companyDescription || 'Kurumsal İstihbarat ve B2B Otomasyon'})`;

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `ŞİRKET ANALİZİ: "${name}" (${website || 'URL bilinmiyor'})
      ${senderContext}
      GÖREV: Bu şirketin iletişim e-postasını, telefonunu ve sosyal medya (LinkedIn/Instagram) linklerini bul.
      Bu şirkete özel, onları etkileyecek profesyonel bir B2B e-posta taslağı ve özel bir 'buzkıran' cümlesi hazırla.`,
      config: { 
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            icebreaker: { type: Type.STRING },
            emailSubject: { type: Type.STRING },
            emailDraft: { type: Type.STRING },
            industry: { type: Type.STRING },
            linkedin: { type: Type.STRING },
            instagram: { type: Type.STRING },
            twitter: { type: Type.STRING }
          }
        }
      },
    });
    const text = response.text;
    return text ? JSON.parse(text) : {};
  }, onRetry);
};
