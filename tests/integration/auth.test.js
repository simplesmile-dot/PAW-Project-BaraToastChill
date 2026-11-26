const request = require('supertest');
const app = require('../../app');
const pesananModel = require('../../models/pesananModel');
const produkModel = require('../../models/produkModel');
const { validAdmin, invalidAdmin } = require('../fixtures/users');
const { allProducts } = require('../fixtures/products');
const { sampleOrderBaru } = require('../fixtures/orders');

describe('Integration Test: Autentikasi & Akses Admin (/admin)', () => {
  it('mengarahkan ke /admin/login jika mengakses /admin tanpa login', async () => {
    const res = await request(app).get('/admin');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/admin/login');
  });

  it('menampilkan halaman login di GET /admin/login', async () => {
    const res = await request(app).get('/admin/login');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Login Admin');
  });

  it('menolak login dengan kredensial salah (401)', async () => {
    const res = await request(app)
      .post('/admin/login')
      .send(invalidAdmin);

    expect(res.status).toBe(401);
    expect(res.body.pesan).toContain('salah');
  });

  it('mengizinkan login valid, mengakses dashboard /admin, dan logout', async () => {
    vi.spyOn(pesananModel, 'getAllOrders').mockResolvedValue([sampleOrderBaru]);
    vi.spyOn(produkModel, 'getAll').mockResolvedValue(allProducts);

    const agent = request.agent(app);

    const loginRes = await agent
      .post('/admin/login')
      .set('Accept', 'application/json')
      .send(validAdmin);

    expect(loginRes.status).toBe(200);
    expect(loginRes.headers['set-cookie']).toBeDefined();

    const dashRes = await agent.get('/admin');
    expect(dashRes.status).toBe(200);
    expect(dashRes.text).toContain('Dashboard Admin');
    expect(dashRes.text).toContain('BTC-0002');

    const logoutRes = await agent.post('/admin/logout');
    expect(logoutRes.status).toBe(302);
    expect(logoutRes.headers.location).toBe('/admin/login');

    const afterLogoutRes = await agent.get('/admin');
    expect(afterLogoutRes.status).toBe(302);
    expect(afterLogoutRes.headers.location).toBe('/admin/login');
  });
});
