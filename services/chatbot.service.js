// Layanan chatbot berbasis tombol menu terpandu dan kata kunci sederhana (sesuai PRD).
const config = require('../config');
const produkModel = require('../models/produkModel');
const pesananModel = require('../models/pesananModel');
const { formatRupiah } = require('../utils/format');

const MAIN_MENU_BUTTONS = [
  { label: 'Lihat Menu', action: 'LIHAT_MENU' },
  { label: 'Keranjang', action: 'KERANJANG' },
  { label: 'Cek Status Pesanan', action: 'CEK_STATUS_PROMPT' },
  { label: 'Info Toko', action: 'INFO_TOKO' },
];

const formatStoreInfo = () => {
  const s = config.store;
  return [
    `Informasi Toko ${s.name}:`,
    `- Jam Buka: ${s.hours}`,
    `- Alamat: ${s.address}`,
    `- Kontak: WhatsApp ${s.phone} | Instagram ${s.instagram}`,
    `- Pembayaran: ${s.paymentNote}`,
  ].join('\n');
};

const formatOrderSummary = (order) => {
  const itemLines = order.items
    .map((it) => `- ${it.nama_produk} x${it.jumlah} (${formatRupiah(it.subtotal)})`)
    .join('\n');

  const lines = [
    `Nomor Pesanan: ${order.nomor_pesanan}`,
    `Nama: ${order.nama_pelanggan}`,
    `Jenis: ${order.jenis_pesanan}`,
    `Status: ${order.status}`,
    'Rincian:',
    itemLines,
    `Total: ${formatRupiah(order.total_harga)}`,
  ];

  if (order.catatan) {
    lines.push(`Catatan: ${order.catatan}`);
  }
  return lines.join('\n');
};

const normalizeOrderNumber = (text) => {
  const match = String(text || '')
    .trim()
    .toUpperCase()
    .match(/\bBTC[- ]?(\d{1,6})\b/);
  if (!match) return null;
  const num = match[1].padStart(4, '0');
  return `BTC-${num}`;
};

const extractManualOrderLookup = (text) => {
  const trimmed = String(text || '').trim();
  const direct = normalizeOrderNumber(trimmed);
  if (direct) return direct;

  // Jika pengguna mengetik pola "cek <kode>" atau "status <kode>" dengan kode non-standar
  const cmdMatch = trimmed.match(/^(?:cek(?:\s+status|\s+pesanan)?|status)\s+([A-Za-z0-9-]+)$/i);
  if (cmdMatch) {
    return cmdMatch[1].trim().toUpperCase();
  }
  return null;
};

async function processChat({ message = '', action = '' }) {
  const cleanMsg = String(message || '').trim();
  const cleanAction = String(action || '').trim().toUpperCase();
  const lower = cleanMsg.toLowerCase();

  // 1. Aksi atau kata kunci: Lihat Menu (US-01)
  if (
    cleanAction === 'LIHAT_MENU' ||
    /\b(lihat menu|daftar menu|menu|harga|roti|minuman|list)\b/i.test(lower)
  ) {
    // Hindari menangkap "menu utama" sebagai daftar produk jika user minta menu utama
    if (!/\bmenu utama\b/i.test(lower) || cleanAction === 'LIHAT_MENU') {
      const tersedia = await produkModel.getAvailable();
      if (tersedia.length === 0) {
        return {
          type: 'menu',
          reply: 'Maaf, saat ini belum ada menu yang tersedia.',
          menu: [],
          buttons: MAIN_MENU_BUTTONS,
        };
      }

      const daftarTeks = tersedia
        .map((p) => `- ${p.nama} (${p.kategori}) — ${formatRupiah(p.harga)}`)
        .join('\n');

      return {
        type: 'menu',
        reply: `Berikut menu yang tersedia hari ini:\n${daftarTeks}\n\nPilih jumlah lalu klik "+ Keranjang" pada menu di bawah ini:`,
        menu: tersedia,
        buttons: [
          { label: 'Keranjang', action: 'KERANJANG' },
          { label: 'Info Toko', action: 'INFO_TOKO' },
          { label: 'Cek Status Pesanan', action: 'CEK_STATUS_PROMPT' },
        ],
      };
    }
  }

  // 2. Aksi atau kata kunci: Keranjang / Pesan (US-02, US-03)
  if (
    cleanAction === 'KERANJANG' ||
    /^(keranjang|cart|pesan|order|checkout|beli)$/i.test(lower)
  ) {
    return {
      type: 'cart',
      reply: 'Silakan periksa keranjang Anda, isi nama pemesan dan jenis pesanan, lalu tekan tombol "Pesan".',
      buttons: [
        { label: 'Lihat Menu', action: 'LIHAT_MENU' },
        { label: 'Cek Status Pesanan', action: 'CEK_STATUS_PROMPT' },
        { label: 'Info Toko', action: 'INFO_TOKO' },
      ],
    };
  }

  // 3. Aksi atau kata kunci: Minta input nomor pesanan (US-05)
  if (
    cleanAction === 'CEK_STATUS_PROMPT' ||
    /^(cek status|cek status pesanan|status|status pesanan|cek pesanan|lacak)$/i.test(lower)
  ) {
    return {
      type: 'status_prompt',
      reply: 'Silakan ketik nomor pesanan Anda (contoh: BTC-0001) untuk mengecek status pesanan.',
      buttons: MAIN_MENU_BUTTONS,
    };
  }

  // 4. Aksi atau kata kunci: Cek Status Pesanan dengan nomor pesanan (US-05)
  const orderCode = extractManualOrderLookup(cleanMsg);
  if (cleanAction === 'CEK_STATUS' || orderCode) {
    const codeToCheck = orderCode || cleanMsg.toUpperCase();
    const order = await pesananModel.getByNomor(codeToCheck);

    if (!order) {
      return {
        type: 'order_not_found',
        reply: 'Pesanan tidak ditemukan. Pastikan nomor pesanan Anda benar (contoh: BTC-0001).',
        buttons: MAIN_MENU_BUTTONS,
      };
    }

    return {
      type: 'order_status',
      reply: formatOrderSummary(order),
      order,
      buttons: MAIN_MENU_BUTTONS,
    };
  }

  // 5. Aksi atau kata kunci: Info Toko (US-04)
  if (
    cleanAction === 'INFO_TOKO' ||
    /\b(info toko|info|toko|jam buka|jam|buka|tutup|alamat|lokasi|dimana|di mana|kontak|wa|whatsapp|ig|instagram|bayar|pembayaran)\b/i.test(
      lower
    )
  ) {
    return {
      type: 'info',
      reply: formatStoreInfo(),
      buttons: MAIN_MENU_BUTTONS,
    };
  }

  // 6. Sapaan / Menu Utama / Bantuan (US-04)
  if (
    cleanAction === 'MENU_UTAMA' ||
    /^(halo|hai|hi|hello|pagi|siang|sore|malam|mulai|start|bantuan|help|menu utama)$/i.test(lower)
  ) {
    return {
      type: 'welcome',
      reply:
        'Halo! Selamat datang di ChatBot Bara Toast & Chill. Pilih salah satu menu utama di bawah untuk melihat menu, memesan, cek status pesanan, atau melihat info toko.',
      buttons: MAIN_MENU_BUTTONS,
    };
  }

  // 7. Kata kunci tidak dikenali -> pesan bantuan & tombol menu utama (US-04)
  return {
    type: 'help',
    reply:
      'Maaf, pesan tidak dikenali. Gunakan tombol menu utama di bawah ini, atau ketik kata kunci seperti "menu", "jam buka", "alamat", "keranjang", atau masukkan nomor pesanan (contoh: BTC-0001).',
    buttons: MAIN_MENU_BUTTONS,
  };
}

module.exports = { processChat, MAIN_MENU_BUTTONS };
