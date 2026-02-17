
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
ANA DEĞERİMİZ: ${sender?.globalPitch || 'Verimlilik ve Otonom Büyüme'}
`;

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
      HEDEF ŞİRKET: "${name}" (${website || 'N/A'})
      SEKTÖR: ${sector}
      ${senderContext}

      GÖREV:
      1. Şirketin güncel TELEFON ve EMAIL adresini bul.
      2. Şirketin en büyük 3 RAKİBİNİ belirle.
      3. Şirketin bu sektörde yaşadığı olası 2 ana ACI NOKTASINI (Pain Points) analiz et.
      4. Bu acı noktalarına çözüm sunan ULTRA-STRATEJİK bir e-posta taslağı oluştur.

      E-POSTA TASLAĞI KURALLARI:
      - Ton: Profesyonel, sonuç odaklı ve merak uyandırıcı.
      - Yapı: 
        - Paragraf 1: Samimi bir giriş ve onları neden takip ettiğinize dair (sektördeki yerleri, rakipleriyle kıyaslandığında başarıları vb.) bir vurgu.
        - Paragraf 2: Tespit ettiğiniz bir soruna (acı noktası) değinme ve "Biz [Şirket Adınız] olarak bu konuda nasıl bir değer katıyoruz" açıklaması.
        - Paragraf 3: Net bir "Call to Action" (Harekete Geçirici Mesaj). Örn: "Salı günü 10 dakikalık bir demo için müsait misiniz?"
      - Dil: Akıcı ve kurumsal bir İstanbul Türkçesi.
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
            industry: { type: Type.STRING },
            description: { type: Type.STRING },
            starRating: { type: Type.NUMBER },
            competitors: { type: Type.ARRAY, items: { type: Type.STRING } },
            painPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            strategicValue: { type: Type.STRING },
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
        ? `"${queryContext}" sitesindeki katılımcı listesini çıkar. Her firmanın TELEFON ve web sitesini mutlaka tespit et. Limit: ${limit}.`
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
