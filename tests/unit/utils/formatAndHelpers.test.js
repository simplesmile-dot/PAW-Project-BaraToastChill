const { formatRupiah } = require('../../../utils/format');
const asyncHandler = require('../../../utils/asyncHandler');
const { describeDbError } = require('../../../utils/dbError');
const validateChatInput = require('../../../middlewares/validateChatInput');
const logger = require('../../../middlewares/logger');
const {
  getAdminSession,
  setAdminSession,
  clearAdminSession,
  requireAdminPage,
  requireAdminApi,
} = require('../../../middlewares/adminAuth');

const createMockRes = () => {
  const res = {
    statusCode: 200,
    body: null,
    redirectUrl: null,
    cookies: {},
    clearedCookies: [],
    listeners: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
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
      this.clearedCookies.push({ name, opts });
      return this;
    },
    on(event, fn) {
      this.listeners[event] = fn;
    },
  };
  return res;
};

describe('Unit Test: utils & middlewares', () => {
  describe('utils/format.js', () => {
    it('memformat angka ke format Rupiah dengan pemisah titik ribuan', () => {
      expect(formatRupiah(0)).toBe('Rp0');
      expect(formatRupiah(5000)).toBe('Rp5.000');
      expect(formatRupiah(15000)).toBe('Rp15.000');
      expect(formatRupiah(1250000)).toBe('Rp1.250.000');
    });
  });

  describe('utils/asyncHandler.js', () => {
    it('meneruskan error async ke fungsi next', async () => {
      const boom = new Error('DB error');
      const next = vi.fn();
      const wrapped = asyncHandler(async () => {
        throw boom;
      });

      await wrapped({}, {}, next);
      expect(next).toHaveBeenCalledWith(boom);
    });
  });

  describe('utils/dbError.js', () => {
    it('menerjemahkan kode error PostgreSQL umum menjadi pesan informatif', () => {
      expect(describeDbError({ code: 'ECONNREFUSED' })).toContain('Tidak dapat terhubung ke PostgreSQL');
      expect(describeDbError({ original: { code: '28P01' } })).toContain('Password untuk user');
      expect(describeDbError({ parent: { code: '28000' } })).toContain('tidak dikenali');
      expect(describeDbError({ code: '3D000' })).toContain('belum ada');
      expect(describeDbError({ code: 'ENOTFOUND' })).toContain('tidak ditemukan');
      expect(describeDbError({ message: 'Unknown failure' })).toContain('Gagal menyiapkan database: Unknown failure');
    });
  });

  describe('middlewares/validateChatInput.js', () => {
    it('meloloskan request jika message atau action valid', () => {
      const next1 = vi.fn();
      validateChatInput({ body: { message: 'lihat menu' } }, createMockRes(), next1);
      expect(next1).toHaveBeenCalledTimes(1);

      const next2 = vi.fn();
      validateChatInput({ body: { action: 'LIHAT_MENU' } }, createMockRes(), next2);
      expect(next2).toHaveBeenCalledTimes(1);
    });

    it('menolak request jika message dan action kosong atau melebihi 500 karakter', () => {
      const resEmpty = createMockRes();
      const nextEmpty = vi.fn();
      validateChatInput({ body: { message: '   ' } }, resEmpty, nextEmpty);
      expect(resEmpty.statusCode).toBe(400);
      expect(resEmpty.body.success).toBe(false);
      expect(nextEmpty).not.toHaveBeenCalled();

      const resLong = createMockRes();
      validateChatInput({ body: { message: 'x'.repeat(501) } }, resLong, vi.fn());
      expect(resLong.statusCode).toBe(400);
      expect(resLong.body.error).toContain('Maksimal 500 karakter');
    });
  });

  describe('middlewares/adminAuth.js', () => {
    it('membuat cookie sesi admin valid dan memverifikasinya', () => {
      const res = createMockRes();
      setAdminSession(res, 'admin');

      const token = res.cookies.bara_admin_session.val;
      expect(token).toContain('.');

      const session = getAdminSession({ headers: { cookie: `bara_admin_session=${encodeURIComponent(token)}` } });
      expect(session).not.toBeNull();
      expect(session.u).toBe('admin');
    });

    it('menolak token yang dimanipulasi atau tidak valid', () => {
      expect(getAdminSession({ headers: {} })).toBeNull();
      expect(getAdminSession({ headers: { cookie: 'bara_admin_session=invalidtoken' } })).toBeNull();
      expect(getAdminSession({ headers: { cookie: 'bara_admin_session=abc.def' } })).toBeNull();
    });

    it('mengarahkan ke /admin/login atau mengembalikan 401 saat belum login', () => {
      const resPage = createMockRes();
      requireAdminPage({ headers: {} }, resPage, vi.fn());
      expect(resPage.redirectUrl).toBe('/admin/login');

      const resApi = createMockRes();
      requireAdminApi({ headers: {} }, resApi, vi.fn());
      expect(resApi.statusCode).toBe(401);
      expect(resApi.body.pesan).toContain('Akses ditolak');
    });

    it('meloloskan middleware dan membersihkan cookie saat logout', () => {
      const res = createMockRes();
      setAdminSession(res, 'admin');
      const cookieHeader = `bara_admin_session=${encodeURIComponent(res.cookies.bara_admin_session.val)}`;

      const reqPage = { headers: { cookie: cookieHeader } };
      const nextPage = vi.fn();
      requireAdminPage(reqPage, createMockRes(), nextPage);
      expect(nextPage).toHaveBeenCalled();
      expect(reqPage.adminUser).toBe('admin');

      const reqApi = { headers: { cookie: cookieHeader } };
      const nextApi = vi.fn();
      requireAdminApi(reqApi, createMockRes(), nextApi);
      expect(nextApi).toHaveBeenCalled();

      const resClear = createMockRes();
      clearAdminSession(resClear);
      expect(resClear.clearedCookies[0].name).toBe('bara_admin_session');
    });
  });

  describe('middlewares/logger.js', () => {
    it('mencatat log request setelah response finish', () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const res = createMockRes();
      const next = vi.fn();

      logger({ method: 'GET', originalUrl: '/api/status' }, res, next);
      expect(next).toHaveBeenCalled();
      res.listeners.finish();
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('GET /api/status 200'));
    });
  });
});
