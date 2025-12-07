import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

const distPath = join(process.cwd(), 'dist');

console.log('\n=== 빌드 결과 확인 ===\n');

// 필수 파일 확인
const requiredFiles = [
  'manifest.json',
  'sw.js',
  '.nojekyll',
  'index.html',
  'privacy.html',
  'terms.html',
  'robots.txt',
  'sitemap.xml'
];

let allExists = true;
requiredFiles.forEach(file => {
  const filePath = join(distPath, file);
  if (existsSync(filePath)) {
    console.log(`✓ ${file}`);
  } else {
    console.log(`✗ ${file} - 없음!`);
    allExists = false;
  }
});

// assets 폴더 확인
const assetsPath = join(distPath, 'assets');
if (existsSync(assetsPath)) {
  const assets = readdirSync(assetsPath);
  console.log(`\n✓ assets 폴더 (${assets.length}개 파일)`);
} else {
  console.log('\n✗ assets 폴더 없음!');
  allExists = false;
}

if (!allExists) {
  console.log('\n⚠️  일부 필수 파일이 없습니다. 빌드를 확인하세요.');
  process.exit(1);
} else {
  console.log('\n✓ 모든 필수 파일이 존재합니다.');
}

