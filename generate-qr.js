const QRCode = require('qrcode');
const url = 'http://192.168.1.45:8100';

QRCode.toFile('qrcode.png', url, function (err) {
  if (err) throw err;
  console.log('QR code generated and saved as qrcode.png');
});
