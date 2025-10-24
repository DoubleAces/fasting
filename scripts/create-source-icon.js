const sharp = require('sharp');
const path = require('path');

// Create a simple 512x512 icon with purple background and "F" text
const iconPath = path.join(__dirname, '..', 'public', 'icon-source.png');

// Create SVG with app icon design
const svg = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="512" height="512" fill="#9333EA" rx="80"/>
  
  <!-- Large "F" for Fasting -->
  <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="280" font-weight="bold" fill="#FFFFFF" text-anchor="middle">F</text>
  
  <!-- Small subtitle -->
  <text x="50%" y="85%" font-family="Arial, sans-serif" font-size="48" fill="#FFFFFF" opacity="0.9" text-anchor="middle">FASTING</text>
</svg>
`;

sharp(Buffer.from(svg))
  .png()
  .toFile(iconPath)
  .then(() => {
    console.log('✓ Source icon created at public/icon-source.png');
    console.log('✓ You can now run: node scripts/generate-pwa-icons.js');
  })
  .catch(error => {
    console.error('Error creating source icon:', error);
    process.exit(1);
  });
