'use strict';

const { default: MacacaMacOS } = require('../dist');

async function main() {
  const driver = new MacacaMacOS();
  await driver.startApp('/System/Applications/Calculator.app');
  const isRunning = await driver.isAppRunning('Calculator');
  console.log('app is running: %s', isRunning);
  // const element = await driver.elementByName('1');
}

main().then().catch(console.log);
