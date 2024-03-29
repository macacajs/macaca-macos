import MacacaMacOS from '../src/macaca-macos';
import { Helper } from '../src/core/helper';
import { EDriver } from '../src/core/enums';
import assert from 'assert';

describe('macaca-macos unit testing', function() {
  this.timeout(0);
  process.env.MACACA_MACOS_DEBUG = 'true';
  const driver = new MacacaMacOS();
  let res: any;

  it.skip('isAppRunning should be ok', async () => {
    this.timeout(0);
    assert(driver);
    await driver.startApp('/System/Applications/Notes.app');
    res = await driver.isAppRunning('Notes');
    assert(res);
  });

  it('mouseGetPos should be ok', async () => {
    this.timeout(0);
    const res = driver.mouseGetPos();
    assert(res);
  });

  // 测试
  it.skip('mouseClickText should be ok', async () => {
    this.timeout(0);
    const res = driver.mouseClickText({
      text: '测试',
      shiftX: 100,
    });
    assert(res);
  });

  it.skip('checkTextExist should be ok', async () => {
    this.timeout(0);
    const res = driver.checkTextExist({
      text: '文案存在',
    });
    assert(res);
  });

  it.skip('overwrite should be ok', async () => {
    this.timeout(0);
    driver.fileOcr = async (imgFile) => {
      console.log(imgFile);
      return [
        {
          word: '哈哈',
          rect: {
            left: 0,
            top: 1,
            height: 100,
            width: 100,
          },
        },
      ];
    };
    const res = driver.checkTextExist({
      text: '哈哈',
    });
    assert(res);
  });

  it.skip('mouse drag should be ok', async function() {
    this.timeout(0);
    await Helper.sleep(3E3);
    await driver.mouseDrag(100, 100);
    const res = driver.mouseGetPos();
    console.log(res);
    assert(res.x === 100 && res.y === 100);
  });

  it.skip('screen ocr should be ok', async function() {
    this.timeout(0);
    const res = await driver.screenOcr();
    console.log(JSON.stringify(res, null, 2));
    assert(res.ocrRes);
  });

  it.skip('AppleScript mouseClick should be ok', async () => {
    this.timeout(0);
    driver.mouseClick({
      driver: EDriver.AppleScript,
    });
  });

  it('Clipboard actions should be ok', async () => {
    this.timeout(0);
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
    this.timeout(0);
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
