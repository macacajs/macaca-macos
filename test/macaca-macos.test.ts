import MacacaMacOS from '../src/macaca-macos';
import { Helper } from '../src/core/helper';
import { EDriver } from '../src/core/enums';
import assert from 'power-assert';

describe('macaca-macos unit testing', function() {
  process.env.MACACA_MACOS_DEBUG = 'true';
  const driver = new MacacaMacOS();
  let res;

  it.skip('isAppRunning should be ok', async () => {
    assert(driver);
    await driver.startApp('/System/Applications/Notes.app');
    res = await driver.isAppRunning('Notes');
    assert(res);
  });

  it('mouseGetPos should be ok', async () => {
    const res = driver.mouseGetPos();
    assert(res);
  });

  it('mouse drag should be ok', async function() {
    this.timeout(0);
    await Helper.sleep(5E3);
    await driver.mouseDrag(100, 100);
    const res = driver.mouseGetPos();
    console.log(res);
    assert(res.x === 100);
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

  describe.skip('Network driver test', function() {

    it('wifi device name should work', async function() {
      this.timeout(0);
      const name = driver.getWifiDeviceName();
      assert(name, 'wifi设备查询异常');
    });

    it('wifi device turn on should work', async function() {
      this.timeout(0);
      driver.wifiTurnOn();
      const isWifiOn = driver.isWifiOn();
      assert(isWifiOn, 'wifi状态检查异常');
    });

  });
});
