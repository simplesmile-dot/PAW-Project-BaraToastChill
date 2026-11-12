// config/gemini.js
async function getChatResponse(userMessage, contextProduk = '', retries = 3) {
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Gunakan versi Flash-Lite agar prosesnya jauh lebih ringan dan cepat
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

    const systemInstruction = `Kamu adalah AI Assistant resmi untuk "BaraToastChill", kedai roti bakar yang santai dan kekinian. Tugasmu adalah membantu pelanggan seputar menu dan harga dengan singkat dan cepat. Daftar produk saat ini:\n${contextProduk}\n\nAturan: Hanya jawab pertanyaan seputar menu/kedai BaraToastChill secara ringkas.`;

    const requestBody = {
        contents: [
            {
                role: "user",
                parts: [
                    { text: `${systemInstruction}\n\nPertanyaan: ${userMessage}` }
                ]
            }
        ],
        // Konfigurasi tambahan untuk membatasi beban dan mempercepat respons
        generationConfig: {
            temperature: 0.4,       // Membuat jawaban lebih terarah dan tidak terlalu kreatif (lebih cepat)
            maxOutputTokens: 250,   // Membatasi panjang teks balasan maksimal (tidak mikir panjang)
        }
    };

    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 503 && i < retries - 1) {
                    console.warn(`Model Lite sibuk, mencoba ulang (${i + 1}/${retries})...`);
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    continue;
                }
                console.error("Gemini API Error Detail:", data);
                throw new Error(data.error?.message || 'Gagal terhubung ke Gemini API');
            }

            const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            return replyText || "Maaf, AI tidak memberikan respons.";
        } catch (error) {
            if (i === retries - 1) {
                console.error("Error communicating with Gemini API:", error);
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
    }
}

module.exports = { getChatResponse };