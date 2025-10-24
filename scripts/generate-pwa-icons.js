const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Ensure icons directory exists
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Source icon path (512x512 minimum)
const sourceIcon = path.join(__dirname, '..', 'public', 'icon-source.png');

if (!fs.existsSync(sourceIcon)) {
  console.error('Error: icon-source.png not found in public/ directory');
  console.error('Please create a 512x512 PNG icon with your app branding');
  process.exit(1);
}

const icons = [
  // Standard icons
  { size: 192, name: 'icon-192x192.png', maskable: false },
  { size: 512, name: 'icon-512x512.png', maskable: false },
  // Maskable icons (with safe zone padding)
  { size: 192, name: 'icon-maskable-192x192.png', maskable: true },
  { size: 512, name: 'icon-maskable-512x512.png', maskable: true },
  // Badge icon (monochrome for notifications)
  { size: 72, name: 'badge-72x72.png', badge: true },
];

async function generateIcon(config) {
  const outputPath = path.join(iconsDir, config.name);
  
  try {
    let processor = sharp(sourceIcon);
    
    if (config.maskable) {
      // Add 20% safe zone padding for maskable icons
      const paddedSize = Math.round(config.size * 1.2);
      processor = processor
        .resize(config.size, config.size, { fit: 'contain', background: { r: 147, g: 51, b: 234, alpha: 1 } })
        .extend({
          top: Math.round((paddedSize - config.size) / 2),
          bottom: Math.round((paddedSize - config.size) / 2),
          left: Math.round((paddedSize - config.size) / 2),
          right: Math.round((paddedSize - config.size) / 2),
          background: { r: 147, g: 51, b: 234, alpha: 1 }
        })
        .resize(config.size, config.size);
    } else if (config.badge) {
      // Convert to monochrome for badge icon
      processor = processor
        .resize(config.size, config.size)
        .greyscale()
        .flatten({ background: { r: 255, g: 255, b: 255 } });
    } else {
      // Standard resize
      processor = processor.resize(config.size, config.size);
    }
    
    await processor.png().toFile(outputPath);
    console.log(`✓ Generated ${config.name}`);
  } catch (error) {
    console.error(`✗ Error generating ${config.name}:`, error.message);
    process.exit(1);
  }
}

async function generateAllIcons() {
  console.log('Generating PWA icons...\n');
  
  for (const config of icons) {
    await generateIcon(config);
  }
  
  console.log('\n✓ All icons generated successfully!');
  console.log(`Output directory: ${iconsDir}`);
}

generateAllIcons();
