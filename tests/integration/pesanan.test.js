const request = require('supertest');
const app = require('../../app');
const pesananModel = require('../../models/pesananModel');
const { validAdmin } = require('../fixtures/users');
const { sampleOrderBaru, sampleOrderDiproses, validOrderPayload } = require('../fixtures/orders');

async function loginAsAdmin() {
  const agent = request.agent(app);
  await agent.post('/admin/login').set('Accept', 'application/json').send(validAdmin);
  return agent;
}

describe('Integration Test: Alur Pesanan Konsumen & Admin (/api/pesanan)', () => {
  it('POST /api/pesanan membuat pesanan valid dan menolak payload tidak valid', async () => {
    vi.spyOn(pesananModel, 'createOrder').mockResolvedValue(sampleOrderBaru);

    const resEmptyName = await request(app)
      .post('/api/pesanan')
      .send({ ...validOrderPayload, nama_pelanggan: '' });
    expect(resEmptyName.status).toBe(400);

    const resOk = await request(app).post('/api/pesanan').send(validOrderPayload);
    expect(resOk.status).toBe(201);
    expect(resOk.body.data.nomor_pesanan).toBe('BTC-0002');
    expect(resOk.body.data.status).toBe('Baru');
  });

  it('GET /api/pesanan/cek/:nomor mengembalikan status pesanan atau 404 jika tidak ada', async () => {
    vi.spyOn(pesananModel, 'getByNomor').mockResolvedValueOnce(sampleOrderDiproses).mockResolvedValueOnce(null);

    const resFound = await request(app).get('/api/pesanan/cek/BTC-0001');
    expect(resFound.status).toBe(200);
    expect(resFound.body.data.status).toBe('Diproses');

    const resMissing = await request(app).get('/api/pesanan/cek/BTC-9999');
    expect(resMissing.status).toBe(404);
    expect(resMissing.body.pesan).toBe('Pesanan tidak ditemukan');
  });

  it('melindungi GET /api/pesanan dan PATCH /api/pesanan/:id/status jika belum login', async () => {
    const resList = await request(app).get('/api/pesanan');
    expect(resList.status).toBe(401);

    const resPatch = await request(app).patch('/api/pesanan/1/status').send({ status: 'Diproses' });
    expect(resPatch.status).toBe(401);
  });

  it('admin dapat melihat daftar pesanan dan mengubah status pesanan', async () => {
    const agent = await loginAsAdmin();
    const updatedOrder = { ...sampleOrderBaru, status: 'Siap' };

    vi.spyOn(pesananModel, 'getAllOrders').mockResolvedValue([sampleOrderBaru, sampleOrderDiproses]);
    vi.spyOn(pesananModel, 'updateStatus').mockResolvedValueOnce(updatedOrder).mockResolvedValueOnce(null);

    const resList = await agent.get('/api/pesanan');
    expect(resList.status).toBe(200);
    expect(resList.body).toHaveLength(2);

    const resBadStatus = await agent.patch('/api/pesanan/2/status').send({ status: 'Batal' });
    expect(resBadStatus.status).toBe(400);

    const resUpdate = await agent.patch('/api/pesanan/2/status').send({ status: 'Siap' });
    expect(resUpdate.status).toBe(200);
    expect(resUpdate.body.data.status).toBe('Siap');

    const resNotFound = await agent.patch('/api/pesanan/999/status').send({ status: 'Siap' });
    expect(resNotFound.status).toBe(404);
  });
});
