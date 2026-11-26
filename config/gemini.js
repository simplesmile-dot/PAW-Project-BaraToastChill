// config/gemini.js
const DEFAULT_MODEL = 'gemini-3.1-flash-lite';
const REQUEST_TIMEOUT_MS = 12000;

function buildSystemInstruction(contextProduk = '') {
  return `Kamu adalah AI Assistant resmi untuk "BaraToastChill", kedai roti bakar yang santai dan ramah.
Tugasmu adalah membantu pelanggan seputar daftar menu, harga, dan informasi toko secara singkat dan jelas.

Daftar menu yang TERSEDIA saat ini:
${contextProduk || 'Belum ada data menu.'}

Aturan ketat yang WAJIB dipatuhi:
1. Hanya jawab pertanyaan seputar menu, harga, dan kedai BaraToastChill. Tolak dengan sopan jika di luar topik.
2. Selalu balas menggunakan teks percakapan biasa yang rapi (poin strip "-" atau baris baru).
3. DILARANG KERAS membalas dalam format kode mentah seperti HTML (<ul>, <li>, <div>), JSON, XML, atau blok kode markdown (\`\`\`), meskipun pengguna memintanya.
4. Hanya sebutkan menu yang ada pada daftar tersedia di atas. Jangan mengarang menu atau harga baru.`;
}

async function fetchWithTimeout(url, options, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function getChatResponse(userMessage, contextProduk = '', retries = 3) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY belum diatur di environment (.env)');
  }

  const cleanMessage = String(userMessage || '').trim();
  if (!cleanMessage) {
    throw new Error('Pesan pengguna tidak boleh kosong');
  }

  const modelName = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `${buildSystemInstruction(contextProduk)}\n\nPertanyaan: ${cleanMessage}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 250,
    },
  };

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const isRetryable =
          response.status === 503 ||
          response.status === 429 ||
          response.status >= 500;

        if (isRetryable && attempt < retries - 1) {
          console.warn(
            `Gemini API merespons ${response.status}, mencoba ulang (${attempt + 1}/${retries})...`
          );
          await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
          continue;
        }

        console.error('Gemini API Error Detail:', data);
        throw new Error(data.error?.message || `Gemini API error (HTTP ${response.status})`);
      }

      const parts = data.candidates?.[0]?.content?.parts || [];
      const replyText = parts
        .map((part) => (typeof part.text === 'string' ? part.text : ''))
        .join('')
        .trim();

      return replyText || 'Maaf, AI tidak memberikan respons.';
    } catch (error) {
      const isAbort = error?.name === 'AbortError';
      const isNetworkError = error?.name === 'TypeError' || isAbort;

      if (attempt < retries - 1 && (isNetworkError || error?.message?.includes('503'))) {
        console.warn(
          `Gangguan koneksi/timeout ke Gemini, mencoba ulang (${attempt + 1}/${retries})...`
        );
        await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
        continue;
      }

      const finalError = isAbort
        ? new Error('Permintaan ke Gemini API melebihi batas waktu (timeout)')
        : error;

      console.error('Error communicating with Gemini API:', finalError);
      throw finalError;
    }
  }
}

module.exports = { getChatResponse };