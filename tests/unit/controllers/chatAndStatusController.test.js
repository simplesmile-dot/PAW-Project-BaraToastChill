const chatController = require('../../../controllers/chat.controller');
const statusController = require('../../../controllers/statusController');
const errorController = require('../../../controllers/errorController');
const pageController = require('../../../controllers/pageController');
const adminController = require('../../../controllers/adminController');
const chatbotService = require('../../../services/chatbot.service');
const produkModel = require('../../../models/produkModel');
const pesananModel = require('../../../models/pesananModel');
const { sequelize } = require('../../../models');
const { availableProducts, allProducts } = require('../../fixtures/products');
const { sampleOrderBaru } = require('../../fixtures/orders');
const { validAdmin, invalidAdmin } = require('../../fixtures/users');

const createMockRes = () => ({
  statusCode: 200,
  body: null,
  sentText: null,
  rendered: null,
  redirectUrl: null,
  cookies: {},
  cleared: [],
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(data) {
    this.body = data;
    return this;
  },
  send(text) {
    this.sentText = text;
    return this;
  },
  render(view, data) {
    this.rendered = { view, data };
    return this;
  },
  redirect(url) {
    this.redirectUrl = url;
    return this;
  },
  cookie(name, val, opts) {
    this.cookies[name] = { val, opts };
    return this;
  },
  clearCookie(name, opts) {
    this.cleared.push({ name, opts });
    return this;
  },
});

describe('Unit Test: controllers lainnya (chat, status, error, page, admin)', () => {
  it('chatController.handleChat memanggil chatbotService dan merespons 200', async () => {
    const mockReply = { type: 'info', reply: 'Jam buka 16.00', buttons: [] };
    const spy = vi.spyOn(chatbotService, 'processChat').mockResolvedValue(mockReply);

    const res = createMockRes();
    await chatController.handleChat({ body: { message: 'jam buka' } }, res, vi.fn());

    expect(spy).toHaveBeenCalledWith({ message: 'jam buka', action: undefined });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true, data: mockReply });
  });

  it('statusController.getStatus melaporkan status database terhubung dan terputus', async () => {
    vi.spyOn(sequelize, 'authenticate').mockResolvedValueOnce();
    const resOk = createMockRes();
    await statusController.getStatus({}, resOk, vi.fn());
    expect(resOk.body.status).toBe('ok');
    expect(resOk.body.database).toBe('terhubung');

    vi.spyOn(sequelize, 'authenticate').mockRejectedValueOnce(new Error('down'));
    const resDown = createMockRes();
    await statusController.getStatus({}, resDown, vi.fn());
    expect(resDown.body.database).toBe('terputus');
  });

  it('errorController menangani 404 dan 500 untuk endpoint API maupun halaman web', () => {
    const resApi404 = createMockRes();
    errorController.notFound({ originalUrl: '/api/tidak-ada' }, resApi404);
    expect(resApi404.statusCode).toBe(404);
    expect(resApi404.body.pesan).toBe('Endpoint tidak ditemukan');

    const resPage404 = createMockRes();
    errorController.notFound({ originalUrl: '/halaman-hilang' }, resPage404);
    expect(resPage404.statusCode).toBe(404);
    expect(resPage404.rendered.view).toBe('404');

    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const resApi500 = createMockRes();
    errorController.serverError(new Error('Boom'), { originalUrl: '/api/produk' }, resApi500, vi.fn());
    expect(resApi500.statusCode).toBe(500);
    expect(resApi500.body.pesan).toBe('Terjadi kesalahan pada server');

    const resPage500 = createMockRes();
    errorController.serverError(new Error('Boom'), { originalUrl: '/' }, resPage500, vi.fn());
    expect(resPage500.statusCode).toBe(500);
    expect(resPage500.sentText).toBe('Terjadi kesalahan pada server');
    errSpy.mockRestore();
  });

  it('pageController.home merender index dengan produk tersedia', async () => {
    vi.spyOn(produkModel, 'getAvailable').mockResolvedValue(availableProducts);
    const res = createMockRes();
    await pageController.home({}, res, vi.fn());

    expect(res.rendered.view).toBe('index');
    expect(res.rendered.data.produk).toEqual(availableProducts);
  });

  it('adminController mengelola login, logout, dan dashboard', async () => {
    const resLoginView = createMockRes();
    adminController.loginPage({ headers: {} }, resLoginView);
    expect(resLoginView.rendered.view).toBe('admin-login');

    const resWrong = createMockRes();
    adminController.loginSubmit(
      { body: invalidAdmin, is: () => false, headers: {} },
      resWrong
    );
    expect(resWrong.statusCode).toBe(401);
    expect(resWrong.rendered.data.error).toContain('salah');

    const resLoginOk = createMockRes();
    adminController.loginSubmit(
      { body: validAdmin, is: () => false, headers: {} },
      resLoginOk
    );
    expect(resLoginOk.redirectUrl).toBe('/admin');
    expect(resLoginOk.cookies.bara_admin_session).toBeDefined();

    const resLogout = createMockRes();
    adminController.logout({}, resLogout);
    expect(resLogout.redirectUrl).toBe('/admin/login');
    expect(resLogout.cleared[0].name).toBe('bara_admin_session');

    vi.spyOn(pesananModel, 'getAllOrders').mockResolvedValue([sampleOrderBaru]);
    vi.spyOn(produkModel, 'getAll').mockResolvedValue(allProducts);
    const resDash = createMockRes();
    await adminController.dashboard({ adminUser: 'admin' }, resDash, vi.fn());
    expect(resDash.rendered.view).toBe('admin');
    expect(resDash.rendered.data.pesanan).toEqual([sampleOrderBaru]);
  });
});
