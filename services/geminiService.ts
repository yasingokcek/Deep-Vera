
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

export const analyzeOwnWebsite = async (url: string): Promise<Partial<User>> => {
  const ai = getAI();
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `"${url}" web sitesini derinlemesine incele. Bu şirket tam olarak ne iş yapıyor? 
      Aşağıdaki bilgileri yapılandırılmış JSON olarak çıkar:
      1. companyName: Şirketin tam adı.
      2. companyDescription: Profesyonel, etkileyici bir hakkımızda özeti.
      3. mainActivity: Sunduğu temel çözüm ve teknoloji.
      4. targetAudience: En ideal müşteri profili kimdir?
      5. globalPitch: Bu şirket için reddedilemez bir satış teklifi (pitch) taslağı oluştur.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            companyName: { type: Type.STRING },
            companyDescription: { type: Type.STRING },
            mainActivity: { type: Type.STRING },
            targetAudience: { type: Type.STRING },
            globalPitch: { type: Type.STRING }
          }
        }
      }
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
      1. Hedef şirket hakkında güncel bir haber veya gelişme bul.
      2. Şirketin prestijini (starRating) belirle (1-5 arası). Google yorumları ve web sitesi kalitesini baz al.
      3. Şirketin güncel TELEFON NUMARASINI ve iletişim bilgilerini mutlaka tespit et.
      4. DOĞAL TÜMCE DÜZENİNDE, AKICI BİR E-POSTA TASLAĞI oluştur. 
      
      E-POSTA YAZIM KURALLARI (KRİTİK):
      - KESİNLİKLE "Giriş:", "Gelişme:", "Neden Biz:" gibi başlıklar veya madde işaretleri KULLANMA.
      - Metin, tıpkı bir insanın kaleminden çıkmış gibi, birbirine bağlı paragraflar şeklinde olmalı.
      - İlk paragrafta onlara neden ulaştığını (haberleri, başarıları vb.) anlat.
      - İkinci paragrafta nazikçe kendi katma değerinden bahset.
      - Üçüncü paragrafta bir kahve daveti veya tanışma toplantısı önerisiyle bitir.
      - Paragrafları <br><br> ile ayır.
      - Şirket isimlerini <b>Firma Adı</b> şeklinde yap.
      - Hitap: "Sayın <b>[Firma]</b> Yetkilisi," ile başla.
      - Dil profesyonel, nazik ve akıcı bir İstanbul Türkçesi olmalı.
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
        ? `"${queryContext}" sitesindeki katılımcı listesini çıkar. Her firmanın adını, varsa web sitesini ve mutlaka TELEFON numarasını bulmaya çalış. Limit: ${limit}.`
        : `"${location}" bölgesindeki "${sector}" sektöründen ${limit} şirket listele. Her birinin telefon numarasını tespit etmeye çalış. Atla: ${excludeNames.slice(-10).join(", ")}`,
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
