
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
        ? `GÖREV: Şu fuar/etkinlik sitesini analiz et: "${queryContext}". 
           Bu sayfadaki tüm katılımcı (exhibitor) veya sergileyici firma isimlerini bul.
           Eğer sayfa doğrudan liste içermiyorsa, Google Search kullanarak bu sitenin 'katılımcı listesi' sayfasını bul ve oradaki isimleri getir.
           Her şirket için tam isim ve varsa web sitesi URL'sini çıkar.
           Hedef: ${limit} adet şirket.`
        : `GÖREV: "${location}" bölgesindeki "${sector}" sektöründe faaliyet gösteren ${limit} adet büyük ölçekli şirket bul. 
           EK BAĞLAM: ${queryContext}
           ŞU İSİMLERİ ATLA: ${excludeNames.slice(-10).join(", ")}`,
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

    const data = JSON.parse(response.text || '{"leads":[]}');
    return data.leads || [];
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
  
  const senderContext = `GÖNDERİCİ BİLGİLERİ:
- Şirket: ${sender?.companyName || 'DeepVera AI'}
- Uzmanlık Alanı: ${sender?.companyDescription || 'Yapay Zeka ve Veri Madenciliği'}
- Yetkili: ${sender?.authorizedPerson || 'Satış Direktörü'}`;

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `HEDEF ŞİRKET: "${name}" (${website || 'Web sitesi mevcut değil'})
      ${senderContext}

      GÖREV: 
      1. Bu şirketin kurumsal iletişim bilgilerini (E-posta, Tel) ve sosyal medya linklerini bul.
      2. Kişiselleştirilmiş, ikna edici ve profesyonel bir B2B e-posta taslağı hazırla.

      E-POSTA YAZIM KURALLARI (ZORUNLU):
      - Yapı: E-posta metni en az 3 paragraftan oluşmalıdır.
      - Ton: Kurumsal, saygılı ve akıcı bir Türkçe kullan. Normal tümce düzenine sadık kal.
      - Paragraf 1: Etkileyici bir giriş (Buzkıran). Şirketin sektördeki önemine değin.
      - Paragraf 2: Çözüm odaklı değer önerisi. Kendi hizmetlerini onların ihtiyaçlarıyla eşleştir.
      - Paragraf 3: Net bir eylem çağrısı (Toplantı veya katalog talebi).
      - İmza öncesine [COMPANY_LOGO] etiketini yerleştir.
      - Tümce Düzeni: Cümleler devrik olmamalı, paragraf geçişleri mantıklı olmalıdır.`,
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
            icebreaker: { type: Type.STRING, description: "E-postanın girişindeki dikkat çekici cümle" },
            emailSubject: { type: Type.STRING, description: "Dikkat çekici e-posta konusu" },
            emailDraft: { type: Type.STRING, description: "Paragraflar halinde yazılmış tam e-posta metni" },
            industry: { type: Type.STRING }
          }
        }
      },
    });
    return JSON.parse(response.text || '{}');
  }, onRetry);
};
