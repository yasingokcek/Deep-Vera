
/**
 * Gmail API kullanarak direkt (taslak oluşturmadan) e-posta gönderir.
 * Mühendislik yaklaşımı: RFC822 standardına uygun bir e-posta yapısı kurulur,
 * Base64URL ile encode edilir ve Gmail API /send endpoint'ine basılır.
 */
export const sendGmail = async (accessToken: string, to: string, subject: string, body: string) => {
  // UTF-8 ve Türkçe Karakter Güvenliği (Base64 Encoding)
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  
  // RFC822 Standard Message Structure
  const message = [
    `To: ${to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    body,
  ].join('\n');

  // URL-Safe Base64 Encoding
  const base64EncodedEmail = btoa(unescape(encodeURIComponent(message)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: base64EncodedEmail }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Gmail API İletişim Hatası');
  }

  return response.json();
};
