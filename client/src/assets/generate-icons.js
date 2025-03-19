const fs = require('fs');
const { createCanvas } = require('canvas');

// Icon sizes from the manifest
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Function to generate a simple icon with text showing the size
function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Fill with a gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#1976d2');  // Primary color from Angular
  gradient.addColorStop(1, '#63a4ff');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Add a simple "T" logo for Task Manager
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.5}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('T', size / 2, size / 2);
  
  // Add size text at the bottom
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = `${size * 0.12}px Arial`;
  ctx.fillText(`${size}x${size}`, size / 2, size * 0.85);
  
  // Save the image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`./client/src/assets/icons/icon-${size}x${size}.png`, buffer);
  console.log(`Generated icon-${size}x${size}.png`);
}

// Generate all icons
sizes.forEach(generateIcon);
console.log('All icons generated successfully!'); 