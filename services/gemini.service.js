const geminiConfig = require('../config/gemini');
const Produk = require('../models/Produk');

async function processUserMessage(userMessage) {
    // Ambil data produk dari database PostgreSQL lokal
    const listProduk = await Produk.findAll();
    const infoProduk = listProduk.map(p => `- ${p.nama}: Rp ${p.harga} (${p.tersedia ? 'Tersedia' : 'Habis'})`).join('\n');

    return await geminiConfig.getChatResponse(userMessage, infoProduk);
}

module.exports = { processUserMessage };