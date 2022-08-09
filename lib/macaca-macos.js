'use strict';

const shelljs = require('shelljs');
const robotjs = require('robotjs');
const jxa = require('./jsa');

function Application() {}

class MacacaMacOS {
  async openApp(appFileDir) {
    return shelljs.exec(`open ${appFileDir}`, { silent: true });
  }

  getPixelColor(x, y) {
    return robotjs.getPixelColor(x, y);
  }

  getMousePos() {
    return robotjs.getMousePos();
  }

  async getClipText() {
    return jxa.getClipText();
  }
}

MacacaMacOS.version = require('../package').version;
