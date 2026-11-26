# PAW-Project-BaraToastChill

**ChatBot Bara Toast & Chill**: aplikasi web layanan pemesanan mandiri untuk kedai Roti Bakar Bara berbasis chatbot terpandu (tombol menu & kata kunci sederhana) dan dashboard admin/dapur.

## Teknologi
- Node.js + Express.js (server, routing, REST API)
- EJS (view engine)
- Tailwind CSS via CDN (responsif untuk HP & desktop)
- PostgreSQL + Sequelize ORM (`produk`, `pesanan`, `item_pesanan`)
- Autentikasi sesi admin sederhana (cookie bertanda tangan HMAC-SHA256)

## Cara Menjalankan
```bash
npm install
npm run dev      # memakai nodemon (auto-restart)
# atau
npm start
```
Buka `http://localhost:3000` untuk halaman konsumen (chatbot & pemesanan) dan `http://localhost:3000/admin` untuk halaman admin & dapur.

### Akun Login Admin Default (`.env`)
- **Username**: `admin` (`ADMIN_USERNAME`)
- **Password**: `admin123` (`ADMIN_PASSWORD`)

## Halaman & Endpoint Utama
| Method | Path | Keterangan |
|--------|------|------------|
| GET | `/` | Halaman konsumen: chatbot pemesanan, daftar menu tersedia, keranjang & checkout |
| GET | `/admin/login` | Halaman login admin & dapur |
| POST | `/admin/login` | Proses autentikasi admin |
| POST | `/admin/logout` | Keluar dari sesi admin |
| GET | `/admin` | Dashboard admin & dapur (butuh login): daftar pesanan masuk & kelola menu |
| GET | `/api/status` | Status server dan koneksi database (JSON) |
| POST | `/api/chat` | Endpoint chatbot terpandu (menu, info toko, cek status, bantuan) |
| POST | `/api/pesanan` | Buat pesanan baru dari keranjang konsumen |
| GET | `/api/pesanan/cek/:nomor` | Cek status pesanan berdasarkan nomor pesanan (mis. `BTC-0001`) |
| GET | `/api/pesanan` | Daftar pesanan masuk terbaru (butuh login admin) |
| PATCH | `/api/pesanan/:id/status` | Ubah status pesanan: `Baru`, `Diproses`, `Siap` (butuh login admin) |
| GET | `/api/produk` | Daftar menu (`?tersedia=true` untuk hanya yang aktif) |
| POST/PUT/PATCH/DELETE | `/api/produk...` | Kelola menu dan toggle ketersediaan (butuh login admin) |
