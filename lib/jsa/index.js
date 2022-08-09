'use strict';

const execJxa = require('./exec-jxa');

module.exports = {
  async getClipText() {
    return await execJxa(() => {
      const app = Application.currentApplication();
      app.includeStandardAdditions = true;
      return app.theClipboard();
    }, []);
  },
};
