import MacacaMacOS from '../src/macaca-macos';
import { Helper } from '../src/core/helper';
import { EDriver } from '../src/core/enums';
import * as process from 'process';

const assert = require('power-assert');

describe('macaca-macos unit testing', function() {
  process.env.MACACA_MACOS_DEBUG = 'true';
  const driver = new MacacaMacOS();
  let res;

  it('isAppRunning should be ok', async () => {
    assert(driver);
    await driver.startApp('/System/Applications/Notes.app');
    res = await driver.isAppRunning('Notes');
    assert(res);
  });

  it('mouseGetPos should be ok', async () => {
    const res = driver.mouseGetPos();
    assert(res);
  });

  it('AppleScript mouseClick should be ok', async () => {
    driver.mouseClick({
      driver: EDriver.AppleScript,
    });
  });

  it('Clipboard actions should be ok', async () => {
    const str = 'Hello world.';
    await driver.setClipText(str);
    const res = await driver.getClipText();
    assert.equal(res, str, '剪贴板内容不符合预期');
  });

  it('video should be ok', async function() {
    this.timeout(0);
    driver.startVideo({ rectangle: '0,0,400,600' });
    await Helper.sleep(10E3);
    const mov = await driver.saveVideo();
    console.log(mov);
    assert(mov);
  });

  it('focusApp should be ok', async function() {
    this.timeout(0);
    await driver.focusApp('Notes');
    console.log('end');
  });
});
