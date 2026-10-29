# PAW-Project-BaraToastChill

ChatBot Bara Toast & Chill: layanan pemesanan Roti Bakar Bara. Repository ini adalah tahap awal project PAW,
mengikuti dokumen PRD-20240140196-OTS.

## Teknologi
- Node.js + Express.js (server, routing, API)
- EJS (view engine)
- Tailwind CSS via CDN
- Pola MVC, data produk memakai array statis (tanpa database)

## Cara menjalankan
```bash
npm install
npm run dev      # memakai nodemon (auto-restart)
# atau
npm start
```
Buka http://localhost:3000

## Endpoint
| Method | Path          | Keterangan                              |
|--------|---------------|-----------------------------------------|
| GET    | `/`           | Halaman frontend (EJS), daftar menu     |
| GET    | `/api/status` | Status aplikasi (JSON)                  |
| GET    | `/api/produk` | Daftar produk (array JSON)              |

Setiap request dicatat oleh middleware logger di terminal, contoh:
`[2026-10-29T07:29:50.617Z] GET /api/produk 200 - 2ms`

## Struktur folder
```
project/
├── config/        konfigurasi aplikasi (port, nama, versi)
├── models/        data produk (array statis)
├── middlewares/   logger request HTTP
├── controllers/   alur proses request dan response
├── routes/        definisi endpoint API dan halaman
├── views/         template EJS (+ partials)
├── utils/         fungsi bantu (format Rupiah)
├── app.js         entry point Express
└── package.json
```

## Push ke GitHub
```bash
git init
git add .
git commit -m "feat: setup project express ejs mvc"
git branch -M main
git remote add origin https://github.com/<username>/PAW-Project-BaraToastChill.git
git push -u origin main
```
