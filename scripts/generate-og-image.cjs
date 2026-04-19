const sharp = require('sharp');
const path = require('path');

const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#09090b"/>
      <stop offset="100%" style="stop-color:#18181b"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#38bdf8"/>
      <stop offset="100%" style="stop-color:#22d3ee"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="1200" height="4" fill="url(#accent)"/>
  <rect x="80" y="200" width="64" height="64" rx="12" fill="#38bdf8"/>
  <text x="112" y="245" font-family="Arial,Helvetica,sans-serif" font-size="36" font-weight="900" fill="#09090b" text-anchor="middle">H</text>
  <text x="170" y="248" font-family="Arial,Helvetica,sans-serif" font-size="42" font-weight="900" fill="#fafafa" letter-spacing="1">HYROX</text>
  <text x="410" y="248" font-family="Arial,Helvetica,sans-serif" font-size="42" font-weight="900" fill="#38bdf8" letter-spacing="1">GUIDE</text>
  <text x="80" y="340" font-family="Arial,Helvetica,sans-serif" font-size="52" font-weight="900" fill="#fafafa">Race. Train. Compete.</text>
  <text x="80" y="400" font-family="Arial,Helvetica,sans-serif" font-size="24" fill="#a1a1aa">The complete resource for Hyrox racing, training &amp; gear.</text>
  <line x1="80" y1="440" x2="400" y2="440" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
</svg>`;

async function main() {
  const outPath = path.join(__dirname, '..', 'public', 'og-default.png');
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  console.log('Created OG image:', outPath);
}

main().catch(console.error);
