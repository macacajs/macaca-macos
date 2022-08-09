'use strict';

const shelljs = require('shelljs');
const robotjs = require('robotjs');

class MacacaMacOS {
  async openApp(appFileDir) {
    return shelljs.exec(`open ${appFileDir}`, { silent: true });
  }

  getPixelColor(x, y) {
    return robotjs.getPixelColor(x, y);
  }
}

MacacaMacOS.version = require('../package').version;
