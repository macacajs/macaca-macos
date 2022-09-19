'use strict';

const { default: MacacaMacOS } = require('../dist');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  const driver = new MacacaMacOS();
  await driver.startApp('/System/Applications/Calculator.app');
  const isRunning = await driver.isAppRunning('Calculator');
  console.log('app is running: %s', isRunning);
  await sleep(3E3);
  await driver.keyboardTap('numpad_1');
  await sleep(3E3);
  await driver.keyboardTap('numpad_1');
  await sleep(3E3);
  await driver.keyboardTap('numpad_1');
  await sleep(3E3);
  await driver.keyboardTap('numpad_1');
}

main().then().catch(console.log);
