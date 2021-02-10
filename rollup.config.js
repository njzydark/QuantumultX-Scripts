import fs from 'fs';
import path from 'path';
import typescript from '@rollup/plugin-typescript';

const taskModulePath = path.resolve(__dirname, './src/task');
const taskModule = fs
  .readdirSync(taskModulePath, { withFileTypes: true })
  .map(dirent => {
    if (dirent.isFile() && !dirent.name.includes('.ts')) {
      return null;
    }
    let filePath = `${taskModulePath}/${dirent.name}`;
    if (dirent.isFile()) {
      return {
        filePath,
        name: dirent.name
      };
    } else {
      filePath = `${filePath}/index.ts`;
      if (fs.existsSync(filePath)) {
        return {
          filePath,
          name: dirent.name + '.ts'
        };
      } else {
        return null;
      }
    }
  })
  .filter(item => item);

const commonConfig = {
  plugins: [typescript()]
};

const finalConfig = [...taskModule].map(file => {
  return {
    input: file.filePath,
    output: {
      dir: `dist/${file.name}`,
      format: 'iife'
    },
    ...commonConfig
  };
});

export default finalConfig;
