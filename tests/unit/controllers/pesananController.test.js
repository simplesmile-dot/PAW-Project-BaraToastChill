const pesananController = require('../../../controllers/pesananController');
const pesananModel = require('../../../models/pesananModel');
const { sampleOrderBaru, sampleOrderDiproses, validOrderPayload } = require('../../fixtures/orders');

const mockRes = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(data) {
    this.body = data;
    return this;
  },
});

describe('Unit Test: controllers/pesananController.js', () => {
  it('createPesanan menyimpan pesanan valid dengan status 201', async () => {
    vi.spyOn(pesananModel, 'createOrder').mockResolvedValue(sampleOrderBaru);

    const res = mockRes();
    await pesananController.createPesanan({ body: validOrderPayload }, res, vi.fn());

    expect(res.statusCode).toBe(201);
    expect(res.body.data.nomor_pesanan).toBe('BTC-0002');
  });

  it('createPesanan mengembalikan 400 jika validasi input gagal atau menu tidak tersedia', async () => {
    const resInvalid = mockRes();
    await pesananController.createPesanan({ body: { nama_pelanggan: '' } }, resInvalid, vi.fn());
    expect(resInvalid.statusCode).toBe(400);

    const bizErr = new Error('Menu sedang habis');
    bizErr.statusCode = 400;
    vi.spyOn(pesananModel, 'createOrder').mockRejectedValue(bizErr);

    const resBiz = mockRes();
    await pesananController.createPesanan({ body: validOrderPayload }, resBiz, vi.fn());
    expect(resBiz.statusCode).toBe(400);
    expect(resBiz.body.pesan).toBe('Menu sedang habis');
  });

  it('cekStatusPesanan mengembalikan data pesanan atau 400/404 jika kosong/tidak ditemukan', async () => {
    vi.spyOn(pesananModel, 'getByNomor').mockResolvedValueOnce(sampleOrderDiproses).mockResolvedValueOnce(null);

    const resOk = mockRes();
    await pesananController.cekStatusPesanan({ params: { nomor: 'BTC-0001' } }, resOk, vi.fn());
    expect(resOk.statusCode).toBe(200);
    expect(resOk.body.data.status).toBe('Diproses');

    const resEmpty = mockRes();
    await pesananController.cekStatusPesanan({ params: { nomor: '   ' } }, resEmpty, vi.fn());
    expect(resEmpty.statusCode).toBe(400);

    const resMissing = mockRes();
    await pesananController.cekStatusPesanan({ params: { nomor: 'BTC-9999' } }, resMissing, vi.fn());
    expect(resMissing.statusCode).toBe(404);
    expect(resMissing.body.pesan).toBe('Pesanan tidak ditemukan');
  });

  it('getAllPesanan meneruskan filter status ke model', async () => {
    const spy = vi.spyOn(pesananModel, 'getAllOrders').mockResolvedValue([sampleOrderBaru]);
    const res = mockRes();
    await pesananController.getAllPesanan({ query: { status: 'Baru' } }, res, vi.fn());
    expect(spy).toHaveBeenCalledWith({ status: 'Baru' });
    expect(res.body).toEqual([sampleOrderBaru]);
  });

  it('updateStatusPesanan memperbarui status atau mengembalikan 400/404', async () => {
    const updated = { ...sampleOrderBaru, status: 'Diproses' };
    vi.spyOn(pesananModel, 'updateStatus').mockResolvedValueOnce(updated).mockResolvedValueOnce(null);

    const resOk = mockRes();
    await pesananController.updateStatusPesanan(
      { params: { id: '2' }, body: { status: 'Diproses' } },
      resOk,
      vi.fn()
    );
    expect(resOk.statusCode).toBe(200);
    expect(resOk.body.data.status).toBe('Diproses');

    const resBadId = mockRes();
    await pesananController.updateStatusPesanan({ params: { id: 'abc' }, body: { status: 'Siap' } }, resBadId, vi.fn());
    expect(resBadId.statusCode).toBe(400);

    const resBadStatus = mockRes();
    await pesananController.updateStatusPesanan({ params: { id: '2' }, body: { status: 'Salah' } }, resBadStatus, vi.fn());
    expect(resBadStatus.statusCode).toBe(400);

    const resNotFound = mockRes();
    await pesananController.updateStatusPesanan({ params: { id: '99' }, body: { status: 'Siap' } }, resNotFound, vi.fn());
    expect(resNotFound.statusCode).toBe(404);
  });
});
