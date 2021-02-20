import fs from 'fs';
import path from 'path';
import typescript from '@rollup/plugin-typescript';

const targetDirPath = path.resolve(__dirname, '../dist');
const taskModulePath = path.resolve(__dirname, '../src/task');
const taskGalleryPath = `${taskModulePath}/gallery.json`;

if (!fs.existsSync(targetDirPath)) {
  fs.mkdirSync(targetDirPath);
}

const taskModule = fs.readdirSync(taskModulePath, { withFileTypes: true }).reduce((acc, dirent) => {
  if (dirent.isFile()) {
    return acc;
  }
  const baseFilePath = `${taskModulePath}/${dirent.name}`;
  const taskScriptFilePath = `${baseFilePath}/index.ts`;
  const rewriteScriptFilePath = `${baseFilePath}/rewrite.ts`;
  const rewriteTxtFilePath = `${baseFilePath}/rewrite.txt`;

  if (fs.existsSync(taskScriptFilePath)) {
    acc.push({
      filePath: taskScriptFilePath,
      name: dirent.name
    });
  }
  if (fs.existsSync(rewriteScriptFilePath)) {
    acc.push({
      filePath: rewriteScriptFilePath,
      name: `${dirent.name}.rewrite`
    });
  }
  if (fs.existsSync(rewriteTxtFilePath)) {
    fs.copyFileSync(rewriteTxtFilePath, `${targetDirPath}/${dirent.name}.rewrite.txt`);
  }
  return acc;
}, []);

const commonConfig = {
  plugins: [typescript()]
};

const finalConfig = [...taskModule].map(file => {
  return {
    input: file.filePath,
    output: {
      dir: targetDirPath,
      entryFileNames: `${file.name}.js`,
      format: 'iife'
    },
    ...commonConfig
  };
});

if (taskGalleryPath) {
  fs.copyFileSync(taskGalleryPath, `${targetDirPath}/gallery.json`);
}

export default finalConfig;
