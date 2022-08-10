import { MacacaMacOS } from '../src/macaca-macos';

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
});
