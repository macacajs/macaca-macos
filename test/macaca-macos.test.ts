import { MacacaMacOS } from '../src/macaca-macos';
import { Helper } from '../src/helper';

const assert = require('power-assert');

describe('unit testing', function() {
  const driver = new MacacaMacOS();
  let res;

  it('isAppRunning should be ok', async () => {
    assert(driver);
    driver.startApp('/System/Applications/Notes.app');
    res = await driver.isAppRunning('Notes');
    assert(res);
  });

  it('video should be ok', async function() {
    this.timeout(0);
    driver.startVideo({ rectangle: '0,0,400,600' });
    await Helper.sleep(10E3);
    const mov = await driver.saveVideo();
    console.log(mov);
    assert(mov);
  });

});
