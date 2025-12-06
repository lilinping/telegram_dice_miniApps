/**
 * 生成测试音效文件
 * 使用Node.js运行此脚本生成简单的测试音效
 * 
 * 运行: node scripts/generate-test-sounds.js
 */

const fs = require('fs');
const path = require('path');

// 创建sounds目录
const soundsDir = path.join(__dirname, '../public/sounds');
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

// 创建空的音频文件占位符
const soundFiles = [
  'cup-shake.mp3',
  'dice-collision.mp3',
  'cup-drop.mp3',
  'cup-lift.mp3',
  'result-show.mp3',
];

console.log('📁 创建音效文件占位符...\n');

soundFiles.forEach(file => {
  const filePath = path.join(soundsDir, file);
  
  // 创建一个小的空文件
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '');
    console.log(`✅ 创建: ${file}`);
  } else {
    console.log(`⏭️  跳过: ${file} (已存在)`);
  }
});

console.log('\n✨ 完成！');
console.log('\n📝 注意：');
console.log('这些是空文件占位符。');
console.log('系统会使用Web Audio API生成简单音效。');
console.log('\n如需真实音效，请：');
console.log('1. 从免费音效库下载（Freesound.org, Zapsplat.com）');
console.log('2. 或使用AI生成（ElevenLabs, Soundraw）');
console.log('3. 替换public/sounds/目录中的文件');
