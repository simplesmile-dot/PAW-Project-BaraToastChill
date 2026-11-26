const produkController = require('../../../controllers/produkController');
const produkModel = require('../../../models/produkModel');
const { availableProducts, allProducts, validNewProduct } = require('../../fixtures/products');

const mockRes = () => {
  const res = {
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
  };
  return res;
};

describe('Unit Test: controllers/produkController.js', () => {
  it('getAllProduk mengembalikan semua produk atau hanya tersedia jika ?tersedia=true', async () => {
    vi.spyOn(produkModel, 'getAll').mockResolvedValue(allProducts);
    vi.spyOn(produkModel, 'getAvailable').mockResolvedValue(availableProducts);

    const resAll = mockRes();
    await produkController.getAllProduk({ query: {} }, resAll, vi.fn());
    expect(resAll.body).toEqual(allProducts);

    const resAvail = mockRes();
    await produkController.getAllProduk({ query: { tersedia: 'true' } }, resAvail, vi.fn());
    expect(resAvail.body).toEqual(availableProducts);
  });

  it('getProdukById menangani ID valid, tidak valid, dan tidak ditemukan', async () => {
    vi.spyOn(produkModel, 'getById').mockResolvedValueOnce(availableProducts[0]).mockResolvedValueOnce(null);

    const resOk = mockRes();
    await produkController.getProdukById({ params: { id: '1' } }, resOk, vi.fn());
    expect(resOk.body).toEqual(availableProducts[0]);

    const resBadId = mockRes();
    await produkController.getProdukById({ params: { id: 'abc' } }, resBadId, vi.fn());
    expect(resBadId.statusCode).toBe(400);

    const resNotFound = mockRes();
    await produkController.getProdukById({ params: { id: '99' } }, resNotFound, vi.fn());
    expect(resNotFound.statusCode).toBe(404);
  });

  it('createProduk mengembalikan 201 saat valid dan 400 saat input salah', async () => {
    const created = { id: 10, ...validNewProduct };
    vi.spyOn(produkModel, 'create').mockResolvedValue(created);

    const resOk = mockRes();
    await produkController.createProduk({ body: validNewProduct }, resOk, vi.fn());
    expect(resOk.statusCode).toBe(201);
    expect(resOk.body).toEqual(created);

    const resInvalid = mockRes();
    await produkController.createProduk({ body: { nama: '' } }, resInvalid, vi.fn());
    expect(resInvalid.statusCode).toBe(400);
    expect(resInvalid.body.errors.length).toBeGreaterThan(0);
  });

  it('updateProduk memperbarui produk atau mengembalikan 400/404 sesuai kondisi', async () => {
    const existing = availableProducts[0];
    const updated = { ...existing, harga: 16000 };
    vi.spyOn(produkModel, 'getById').mockResolvedValueOnce(existing).mockResolvedValueOnce(null).mockResolvedValueOnce(existing);
    vi.spyOn(produkModel, 'update').mockResolvedValue(updated);

    const resOk = mockRes();
    await produkController.updateProduk(
      { params: { id: '1' }, body: { nama: existing.nama, kategori: existing.kategori, harga: 16000 } },
      resOk,
      vi.fn()
    );
    expect(resOk.body).toEqual(updated);

    const resBadId = mockRes();
    await produkController.updateProduk({ params: { id: '0' }, body: {} }, resBadId, vi.fn());
    expect(resBadId.statusCode).toBe(400);

    const resNotFound = mockRes();
    await produkController.updateProduk({ params: { id: '999' }, body: {} }, resNotFound, vi.fn());
    expect(resNotFound.statusCode).toBe(404);

    const resValidation = mockRes();
    await produkController.updateProduk({ params: { id: '1' }, body: { nama: '' } }, resValidation, vi.fn());
    expect(resValidation.statusCode).toBe(400);
  });

  it('toggleStatusProduk mengubah ketersediaan produk', async () => {
    const existing = { ...availableProducts[0], tersedia: true };
    const toggled = { ...existing, tersedia: false };
    vi.spyOn(produkModel, 'getById').mockResolvedValueOnce(existing).mockResolvedValueOnce(null);
    vi.spyOn(produkModel, 'update').mockResolvedValue(toggled);

    const resOk = mockRes();
    await produkController.toggleStatusProduk({ params: { id: '1' }, body: {} }, resOk, vi.fn());
    expect(resOk.body.tersedia).toBe(false);

    const resBadId = mockRes();
    await produkController.toggleStatusProduk({ params: { id: 'x' }, body: {} }, resBadId, vi.fn());
    expect(resBadId.statusCode).toBe(400);

    const resNotFound = mockRes();
    await produkController.toggleStatusProduk({ params: { id: '88' }, body: {} }, resNotFound, vi.fn());
    expect(resNotFound.statusCode).toBe(404);
  });

  it('deleteProduk menghapus produk atau mengembalikan 400/404', async () => {
    const existing = availableProducts[0];
    vi.spyOn(produkModel, 'getById').mockResolvedValueOnce(existing).mockResolvedValueOnce(null);
    vi.spyOn(produkModel, 'remove').mockResolvedValue(true);

    const resOk = mockRes();
    await produkController.deleteProduk({ params: { id: '1' } }, resOk, vi.fn());
    expect(resOk.body.pesan).toBe('Produk berhasil dihapus');

    const resBadId = mockRes();
    await produkController.deleteProduk({ params: { id: '-1' } }, resBadId, vi.fn());
    expect(resBadId.statusCode).toBe(400);

    const resNotFound = mockRes();
    await produkController.deleteProduk({ params: { id: '99' } }, resNotFound, vi.fn());
    expect(resNotFound.statusCode).toBe(404);
  });
});
