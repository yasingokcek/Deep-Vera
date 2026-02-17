
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

export const findCompanyIntel = async (
  name: string, 
  website?: string, 
  sector?: string,
  sender?: User,
  onRetry?: (msg: string) => void
): Promise<Partial<Participant>> => {
  const ai = getAI();
  
  // Kullanıcının (Gönderen) Şirket Bilgileri - Zekayı bu besler
  const senderContext = `
GÖNDEREN (BİZİM ŞİRKETİMİZ) PROFİLİ:
- Şirket: ${sender?.companyName || 'DeepVera AI'}
- Uzmanlık: ${sender?.mainActivity || sender?.companyDescription || 'B2B Satış Otomasyonu ve AI İstihbarat'}
- Rakiplerimiz: ${sender?.competitorsInfo || 'Genel Pazar'}
- Hedef Kitlemiz: ${sender?.targetAudience || 'Karar Vericiler'}
- Yetkili: ${sender?.authorizedPerson || 'Satış Yöneticisi'}
`;

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
      HEDEF ŞİRKET: "${name}" (${website || 'Web sitesi bilinmiyor'})
      HEDEF SEKTÖR: ${sector}
      
      ${senderContext}

      GÖREV:
      1. Google Search kullanarak bu şirket hakkında son 6 ayın kritik haberlerini bul (Yatırım, yeni ürün, CEO/yönetici değişikliği, ödül vb.).
      2. Şirketin kurumsal e-posta formatını ve sosyal medya linklerini (LinkedIn, Instagram) tespit et.
      3. ICEBREAKER: Bulduğun güncel bir habere atıfta bulunarak (Örn: "Son aldığınız yatırım için tebrikler...") şirketin ilgisini çekecek ilk cümleyi yaz.
      4. EMAIL DRAFT: Bizim (Gönderen) çözümlerimizi, onların ${sector} sektöründeki spesifik bir sorununa çözüm olacak şekilde eşleştirerek 1:1 satış e-postası yaz. 
      5. VERIFICATION: Bulduğun e-posta adresi için bir 'healthScore' (0-100) ver.
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
            healthScore: { type: Type.NUMBER },
            isVerified: { type: Type.BOOLEAN },
            newsTrigger: { type: Type.STRING, description: "Atıfta bulunulan güncel haberin özeti" }
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
        ? `"${queryContext}" fuar/etkinlik sitesindeki ${sector} sektörü katılımcı listesini çıkar. Toplam ${limit} adet şirket.`
        : `"${location}" bölgesindeki "${sector}" sektöründen ${limit} adet aktif şirketi listele. Şu isimleri atla: ${excludeNames.slice(-10).join(", ")}`,
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
