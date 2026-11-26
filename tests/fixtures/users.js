// Data contoh akun admin dan pelanggan untuk keperluan testing
const config = require('../../config');

const validAdmin = {
  username: config.admin.username,
  password: config.admin.password,
};

const invalidAdmin = {
  username: 'admin',
  password: 'password-salah',
};

const sampleCustomers = {
  validName: 'Rina',
  emptyName: '   ',
  tooLongName: 'A'.repeat(101),
};

module.exports = {
  validAdmin,
  invalidAdmin,
  sampleCustomers,
};
