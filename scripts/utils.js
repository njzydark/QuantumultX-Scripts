/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs-extra');
const path = require('path');

/**
 * 重命名txt或者json文件中的自定义变量名
 * @param {string} baseUrl 需要替换的baseUrl
 */
const rename = baseUrl => {
  const allFiles = fs.readdirSync(path.resolve(__dirname, '../dist'));

  allFiles.forEach(file => {
    if (/\.(txt|json)$/.test(file)) {
      const filePath = path.resolve(__dirname, `../dist/${file}`);
      const content = fs.readFileSync(filePath).toString();
      if (content.includes('{base_url}')) {
        const res = content.replace(/\{base_url\}/g, baseUrl);
        fs.writeFileSync(filePath, res);
      }
    }
  });
};

/**
 * 复制assets文件夹中的文件
 */
const copyAssets = () => {
  fs.copySync(path.resolve(__dirname, '../src/assets'), path.resolve(__dirname, '../dist'));
};

module.exports = { rename, copyAssets };
