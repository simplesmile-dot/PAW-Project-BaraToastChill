const chatbotService = require('../../../services/chatbot.service');
const produkModel = require('../../../models/produkModel');
const pesananModel = require('../../../models/pesananModel');
const { availableProducts } = require('../../fixtures/products');
const { sampleOrderDiproses } = require('../../fixtures/orders');

describe('Unit Test: services/chatbot.service.js', () => {
  it('menampilkan hanya menu yang tersedia saat aksi LIHAT_MENU', async () => {
    const spy = vi.spyOn(produkModel, 'getAvailable').mockResolvedValue(availableProducts);

    const result = await chatbotService.processChat({ action: 'LIHAT_MENU' });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(result.type).toBe('menu');
    expect(result.menu).toHaveLength(availableProducts.length);
    expect(result.reply).toContain('Roti Bakar Coklat');
    expect(result.reply).toContain('Rp15.000');
  });

  it('menampilkan pesan kosong jika belum ada menu yang tersedia', async () => {
    vi.spyOn(produkModel, 'getAvailable').mockResolvedValue([]);

    const result = await chatbotService.processChat({ message: 'daftar menu' });
    expect(result.type).toBe('menu');
    expect(result.menu).toEqual([]);
    expect(result.reply).toContain('belum ada menu yang tersedia');
  });

  it('menangani aksi KERANJANG dan kata kunci pesan/checkout', async () => {
    const result = await chatbotService.processChat({ action: 'KERANJANG' });
    expect(result.type).toBe('cart');
    expect(result.reply).toContain('keranjang');
  });

  it('menampilkan info toko saat klik Info Toko atau mengetik "jam buka"', async () => {
    const resBtn = await chatbotService.processChat({ action: 'INFO_TOKO' });
    expect(resBtn.type).toBe('info');
    expect(resBtn.reply).toContain('Jam Buka:');
    expect(resBtn.reply).toContain('Alamat:');

    const resKeyword = await chatbotService.processChat({ message: 'jam buka toko kapan?' });
    expect(resKeyword.type).toBe('info');
    expect(resKeyword.reply).toContain('16.00');
  });

  it('meminta nomor pesanan saat aksi CEK_STATUS_PROMPT atau kata kunci "cek status"', async () => {
    const resPrompt = await chatbotService.processChat({ action: 'CEK_STATUS_PROMPT' });
    expect(resPrompt.type).toBe('status_prompt');
    expect(resPrompt.reply).toContain('BTC-0001');

    const resWord = await chatbotService.processChat({ message: 'cek status' });
    expect(resWord.type).toBe('status_prompt');
  });

  it('menampilkan status pesanan jika nomor pesanan ditemukan di database', async () => {
    const spy = vi.spyOn(pesananModel, 'getByNomor').mockResolvedValue(sampleOrderDiproses);

    const result = await chatbotService.processChat({ message: 'btc 1' });

    expect(spy).toHaveBeenCalledWith('BTC-0001');
    expect(result.type).toBe('order_status');
    expect(result.order.status).toBe('Diproses');
    expect(result.reply).toContain('Nomor Pesanan: BTC-0001');
    expect(result.reply).toContain('Status: Diproses');
  });

  it('menampilkan pesan "Pesanan tidak ditemukan" jika nomor tidak ada', async () => {
    vi.spyOn(pesananModel, 'getByNomor').mockResolvedValue(null);

    const result = await chatbotService.processChat({ message: 'cek BTC-9999' });

    expect(result.type).toBe('order_not_found');
    expect(result.reply).toContain('Pesanan tidak ditemukan');
  });

  it('menampilkan sambutan saat sapaan dan bantuan + tombol menu utama untuk kata tidak dikenali', async () => {
    const welcome = await chatbotService.processChat({ message: 'halo' });
    expect(welcome.type).toBe('welcome');
    expect(welcome.buttons).toHaveLength(4);

    const unknown = await chatbotService.processChat({ message: 'siapa presiden mars?' });
    expect(unknown.type).toBe('help');
    expect(unknown.reply).toContain('pesan tidak dikenali');
    expect(unknown.buttons).toEqual(chatbotService.MAIN_MENU_BUTTONS);
  });
});
