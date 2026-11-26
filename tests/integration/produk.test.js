const request = require('supertest');
const app = require('../../app');
const produkModel = require('../../models/produkModel');
const { sequelize } = require('../../models');
const { validAdmin } = require('../fixtures/users');
const { allProducts, availableProducts, validNewProduct, invalidProduct } = require('../fixtures/products');

async function loginAsAdmin() {
  const agent = request.agent(app);
  await agent.post('/admin/login').set('Accept', 'application/json').send(validAdmin);
  return agent;
}

describe('Integration Test: Status & CRUD Produk (/api/status, /api/produk)', () => {
  it('GET /api/status mengembalikan status aplikasi dan koneksi database', async () => {
    vi.spyOn(sequelize, 'authenticate').mockResolvedValue();

    const res = await request(app).get('/api/status');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBe('terhubung');
  });

  it('GET /api/produk dan GET /api/produk?tersedia=true mengembalikan daftar menu', async () => {
    vi.spyOn(produkModel, 'getAll').mockResolvedValue(allProducts);
    vi.spyOn(produkModel, 'getAvailable').mockResolvedValue(availableProducts);

    const resAll = await request(app).get('/api/produk');
    expect(resAll.status).toBe(200);
    expect(resAll.body).toHaveLength(allProducts.length);

    const resAvail = await request(app).get('/api/produk?tersedia=true');
    expect(resAvail.status).toBe(200);
    expect(resAvail.body).toHaveLength(availableProducts.length);
  });

  it('GET /api/produk/:id menangani data ditemukan, ID salah (400), dan tidak ditemukan (404)', async () => {
    vi.spyOn(produkModel, 'getById').mockResolvedValueOnce(availableProducts[0]).mockResolvedValueOnce(null);

    const resOk = await request(app).get('/api/produk/1');
    expect(resOk.status).toBe(200);
    expect(resOk.body.nama).toBe('Roti Bakar Coklat');

    const resBad = await request(app).get('/api/produk/bukan-angka');
    expect(resBad.status).toBe(400);

    const resMissing = await request(app).get('/api/produk/999');
    expect(resMissing.status).toBe(404);
  });

  it('menolak operasi tulis produk tanpa sesi admin (401)', async () => {
    const resPost = await request(app).post('/api/produk').send(validNewProduct);
    expect(resPost.status).toBe(401);

    const resPatch = await request(app).patch('/api/produk/1/status').send({ tersedia: false });
    expect(resPatch.status).toBe(401);
  });

  it('admin dapat membuat, mengubah, menonaktifkan, dan menghapus produk', async () => {
    const agent = await loginAsAdmin();
    const created = { id: 10, ...validNewProduct };
    const updated = { ...created, harga: 21000 };
    const disabled = { ...updated, tersedia: false };

    vi.spyOn(produkModel, 'create').mockResolvedValue(created);
    vi.spyOn(produkModel, 'getById').mockResolvedValue(created);
    vi.spyOn(produkModel, 'update').mockResolvedValueOnce(updated).mockResolvedValueOnce(disabled);
    vi.spyOn(produkModel, 'remove').mockResolvedValue(true);

    const resInvalid = await agent.post('/api/produk').send(invalidProduct);
    expect(resInvalid.status).toBe(400);

    const resCreate = await agent.post('/api/produk').send(validNewProduct);
    expect(resCreate.status).toBe(201);
    expect(resCreate.body.nama).toBe(validNewProduct.nama);

    const resPut = await agent.put('/api/produk/10').send({ ...validNewProduct, harga: 21000 });
    expect(resPut.status).toBe(200);
    expect(resPut.body.harga).toBe(21000);

    const resToggle = await agent.patch('/api/produk/10/status').send({ tersedia: false });
    expect(resToggle.status).toBe(200);
    expect(resToggle.body.tersedia).toBe(false);

    const resDel = await agent.delete('/api/produk/10');
    expect(resDel.status).toBe(200);
    expect(resDel.body.pesan).toBe('Produk berhasil dihapus');
  });
});
