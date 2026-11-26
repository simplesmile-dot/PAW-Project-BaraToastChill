const geminiService = require('../../../services/gemini.service');
const geminiConfig = require('../../../config/gemini');
const Produk = require('../../../models/Produk');
const { allProducts } = require('../../fixtures/products');

describe('Unit Test: services/gemini.service.js', () => {
  it('mengambil daftar produk dan meneruskannya ke getChatResponse', async () => {
    const findSpy = vi.spyOn(Produk, 'findAll').mockResolvedValue(allProducts);
    const geminiSpy = vi
      .spyOn(geminiConfig, 'getChatResponse')
      .mockResolvedValue('Roti Bakar Coklat tersedia seharga Rp 15000.');

    const reply = await geminiService.processUserMessage('Ada roti coklat?');

    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(geminiSpy).toHaveBeenCalledWith(
      'Ada roti coklat?',
      expect.stringContaining('- Roti Bakar Coklat: Rp 15000 (Tersedia)')
    );
    expect(geminiSpy).toHaveBeenCalledWith(
      'Ada roti coklat?',
      expect.stringContaining('- Roti Bakar Tiramisu: Rp 20000 (Habis)')
    );
    expect(reply).toContain('Roti Bakar Coklat');
  });

  it('meneruskan error jika koneksi Gemini gagal', async () => {
    vi.spyOn(Produk, 'findAll').mockResolvedValue(allProducts);
    vi.spyOn(geminiConfig, 'getChatResponse').mockRejectedValue(new Error('API timeout'));

    await expect(geminiService.processUserMessage('Halo')).rejects.toThrow('API timeout');
  });
});
