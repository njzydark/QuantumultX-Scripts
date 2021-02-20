/* eslint-disable @typescript-eslint/no-require-imports */
const loadConfigFile = require('rollup/dist/loadConfigFile');
const path = require('path');
const rollup = require('rollup');
const http = require('http');
const handler = require('serve-handler');
const chalk = require('chalk');
const { rename, copyAssets } = require('./utils');

const isDev = process.env.NODE_ENV === 'dev';

loadConfigFile(path.resolve(__dirname, './rollup.config.js')).then(async ({ options }) => {
  for (const optionsObj of options) {
    const bundle = await rollup.rollup(optionsObj);
    await Promise.all(optionsObj.output.map(bundle.write));
    bundle.watchFiles.forEach(file => {
      console.log(`${chalk.blueBright('Bundle')} ${chalk.blue(file.split('src/')[1])}`);
    });
  }

  copyAssets();

  rename(
    isDev ? 'http://njzydark.com:5000' : 'https://raw.githubusercontent.com/njzydark/QuantumultX-Scripts/main/dist'
  );

  if (isDev) {
    const watcher = rollup.watch(options);
    watcher.on('event', event => {
      if (event.code === 'END') {
        console.log('Waiting for changes...');
      }
    });

    const server = http.createServer((request, response) => {
      return handler(request, response, { public: 'dist' });
    });
    server.listen(5000, () => {
      console.log();
      console.log(chalk.green(`Running at http://localhost:5000`));
      console.log();
    });
  } else {
    console.log();
    console.log(chalk.green(`Build finish, Have fun`));
    console.log();
  }
});
