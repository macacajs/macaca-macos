#!/usr/bin/env ts-node

/**
 * @description macaca-macos cli工具
 */

import MacacaMacOS from '..';
import { Helper } from '../src/core/helper';
import path from 'path';

process.setMaxListeners(0);
process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
  process.exit(1);
});

const { program } = require('commander');
const os = require('os');
const chalk = require('chalk');

const getLogoStr = () => {
  const lines = [
    ' __  __                             __  __             ___  ____ ',
    '|  \\/  | __ _  ___ __ _  ___ __ _  |  \\/  | __ _  ___ / _ \\/ ___| ',
    '| |\\/| |/ _` |/ __/ _` |/ __/ _` | | |\\/| |/ _` |/ __| | | \\___ \\',
    '| |  | | (_| | (_| (_| | (_| (_| | | |  | | (_| | (__| |_| |___) |',
    '|_|  |_|\\__,_|\\___\\__,_|\\___\\__,_| |_|  |_|\\__,_|\\___|\\___/|____/ ',
  ];
  return chalk.green(lines.join(os.EOL));
};

program
  .addHelpText('before', getLogoStr())
  .version(Helper.getPkgVersion());

program
  .command('relative_mouse_pos [appName]')
  .alias('rmp')
  .description('获取鼠标在APP上的相对位置(app界面左上角坐标: 0, 0)')
  .option('-c, --color', '顺带获取点位颜色hex值', false)
  .action(async (appName, opts) => {
    const { color } = opts;
    const driver = new MacacaMacOS();
    const realPos = driver.mouseGetPos();
    const appPos = await driver.getAppSizePosition(appName);
    let relativePos = `${realPos.x - appPos.topLeftX},${realPos.y - appPos.topLeftY}`;
    if (color) {
      const colorHex = driver.getPixelColor(realPos.x, realPos.y);
      relativePos = `${relativePos} ${colorHex}`;
    }
    await driver.setClipText(relativePos);
    console.log(`${appName}窗口相对坐标: ${relativePos} 已复制到剪贴板`);
  });

program
  .command('resize [appName]')
  .description('设置窗口大小和位置')
  .option('-w, --width <number>', '宽', parseInt)
  .option('-h, --height <number>', '高', parseInt)
  .option('-p, --position <value>', '设置app左上角起点 x,y', '0,100')
  .action(async (appName, opts) => {
    const { position, width, height } = opts;
    const driver = new MacacaMacOS();
    await driver.resizePosition({
      name: appName,
      topLeftX: Number.parseInt(position.split(',')[0]),
      topLeftY: Number.parseInt(position.split(',')[1]),
      width, height,
    });
    console.log('success');
  });

program
  .command('ocr [target]')
  .description('app或图片ocr')
  .action(async (target) => {
    const driver = new MacacaMacOS();
    let res;
    if (target.endsWith('.png') || target.endsWith('.jpg')) {
      target = target.startsWith('/') ? target : path.resolve(process.cwd(), target);
      res = driver.screenOcr({
        picFile: target,
      });
    } else {
      const appName = target;
      await driver.focusApp(appName);
      const rect = await driver.getAppSizePosition(appName);
      res = driver.screenOcr({
        rectangle: `${rect.topLeftX},${rect.topLeftY},${rect.width},${rect.height}`,
      });
    }
    console.log(JSON.stringify(res, null, 2));
  });

program.parse(process.argv);
