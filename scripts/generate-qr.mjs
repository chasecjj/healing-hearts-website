import QRCode from 'qrcode';
import { mkdirSync } from 'fs';

mkdirSync('public/qr', { recursive: true });

const targets = [
  { name: 'trisha', url: 'https://healingheartscourse.com/go/trisha' },
  { name: 'jeff',   url: 'https://healingheartscourse.com/go/jeff'   },
];

for (const t of targets) {
  await QRCode.toFile(`public/qr/${t.name}.png`, t.url, {
    errorCorrectionLevel: 'H',
    width: 1200,
    margin: 2,
    color: { dark: '#0F766E', light: '#FAFAF7' },
  });
  console.log(`Wrote public/qr/${t.name}.png`);
}
