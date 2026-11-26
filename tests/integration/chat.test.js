const request = require('supertest');
const app = require('../../app');
const produkModel = require('../../models/produkModel');
const pesananModel = require('../../models/pesananModel');
const { availableProducts } = require('../fixtures/products');
const { sampleOrderDiproses } = require('../fixtures/orders');

describe('Integration Test: Chatbot & Halaman Utama (/, /api/chat)', () => {
  it('GET / merender halaman chatbot konsumen dengan daftar produk tersedia', async () => {
    vi.spyOn(produkModel, 'getAvailable').mockResolvedValue(availableProducts);

    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('ChatBot');
    expect(res.text).toContain('Bara Toast &amp; Chill');
  });

  it('POST /api/chat menolak pesan kosong (400) lewat middleware validasi', async () => {
    const res = await request(app).post('/api/chat').send({ message: '   ' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('tidak boleh kosong');
  });

  it('POST /api/chat mengembalikan menu tersedia saat aksi LIHAT_MENU', async () => {
    vi.spyOn(produkModel, 'getAvailable').mockResolvedValue(availableProducts);

    const res = await request(app).post('/api/chat').send({ action: 'LIHAT_MENU' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.type).toBe('menu');
    expect(res.body.data.menu).toHaveLength(availableProducts.length);
  });

  it('POST /api/chat menjawab info toko dan cek status pesanan melalui HTTP', async () => {
    vi.spyOn(pesananModel, 'getByNomor').mockResolvedValueOnce(sampleOrderDiproses).mockResolvedValueOnce(null);

    const resInfo = await request(app).post('/api/chat').send({ message: 'jam buka' });
    expect(resInfo.status).toBe(200);
    expect(resInfo.body.data.type).toBe('info');
    expect(resInfo.body.data.reply).toContain('Alamat:');

    const resStatus = await request(app).post('/api/chat').send({ message: 'BTC-0001' });
    expect(resStatus.status).toBe(200);
    expect(resStatus.body.data.type).toBe('order_status');
    expect(resStatus.body.data.order.status).toBe('Diproses');

    const resNotFound = await request(app).post('/api/chat').send({ message: 'BTC-9999' });
    expect(resNotFound.status).toBe(200);
    expect(resNotFound.body.data.type).toBe('order_not_found');
    expect(resNotFound.body.data.reply).toContain('Pesanan tidak ditemukan');
  });

  it('POST /api/chat mengembalikan pesan bantuan untuk kata yang tidak dikenali', async () => {
    const res = await request(app).post('/api/chat').send({ message: 'asdfghjkl tidak dikenal' });
    expect(res.status).toBe(200);
    expect(res.body.data.type).toBe('help');
    expect(res.body.data.buttons.length).toBeGreaterThanOrEqual(4);
  });

  it('mengembalikan 404 JSON untuk /api/* dan 404 HTML untuk route web tidak dikenal', async () => {
    const resApi = await request(app).get('/api/endpoint-ngawur');
    expect(resApi.status).toBe(404);
    expect(resApi.body.pesan).toBe('Endpoint tidak ditemukan');

    const resPage = await request(app).get('/halaman-ngawur');
    expect(resPage.status).toBe(404);
    expect(resPage.text).toContain('404');
  });
});
