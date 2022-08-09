'use strict';

const path = require('path');
const assert = require('power-assert');

const MacacaMacOS = require('../lib/macaca-macos');

describe('unit testing', function() {
  const driver = new MacacaMacOS();

  before(async () => {
    await driver.startDevice({
      recordVideo: {
        dir: videoDir,
      },
    });
  });

  it('macOS driver should be ok', () => {
    assert(driver);
  });
});
