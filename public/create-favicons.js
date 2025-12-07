// Node.js 환경에서 파비콘을 생성하는 스크립트
// 사용법: node create-favicons.js

const fs = require('fs');
const { createCanvas } = require('canvas');

const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' }
];

function createFavicon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // 그라데이션 배경
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#4285f4');
  gradient.addColorStop(1, '#357ae8');
  
  const cornerRadius = size * 0.2;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  roundRect(ctx, 0, 0, size, size, cornerRadius);
  ctx.fill();
  
  // 카메라 아이콘 그리기
  const scale = size / 100;
  ctx.save();
  ctx.scale(scale, scale);
  ctx.translate(20, 25);
  
  // 카메라 본체
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  roundRect(ctx, 15, 20, 30, 25, 3);
  ctx.fill();
  
  // 렌즈
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.beginPath();
  ctx.arc(30, 32.5, 8, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(30, 32.5, 5, 0, Math.PI * 2);
  ctx.fill();
  
  // 플래시
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  roundRect(ctx, 45, 22, 4, 6, 1);
  ctx.fill();
  
  // 타임라인 표시
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    roundRect(ctx, 10 + i * 10, 48, 8, 4, 1);
    ctx.fill();
  }
  
  ctx.restore();
  
  // 파일 저장
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`./${filename}`, buffer);
  console.log(`생성 완료: ${filename} (${size}x${size})`);
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// 파비콘 생성
sizes.forEach(({ size, name }) => {
  createFavicon(size, name);
});

console.log('\n모든 파비콘이 생성되었습니다!');

