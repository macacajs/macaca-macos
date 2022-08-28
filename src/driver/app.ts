import shell from 'shelljs';
import { Helper } from '../helper';
import { EDriver } from '../enums';
import { osaUtil } from '../jxa/osaUtil';
import { jxaUtil } from '../jxa/jxaUtil';

export default class AppDriver {
  async hideAllApp() {
    await osaUtil.hideAllApp();
  }

  async startApp(appNameOrFile) {
    if (appNameOrFile.startsWith('/')) {
      return shell.exec(`open ${appNameOrFile}`, { silent: true });
    }
    return await osaUtil.safeLaunchApp(appNameOrFile);
  }

  async focusApp(name: string, opts: {
    driver?: EDriver;
  } = {}) {
    const {
      driver = EDriver.AppleScript,
    } = opts;
    if (driver === EDriver.AppleScript) {
      return osaUtil.focusApp(name);
    } else if (driver === EDriver.JXA) {
      return jxaUtil.focusApp(name);
    }
  }

  async isAppRunning(name: string) {
    return jxaUtil.isAppRunning(name);
  }

  /**
   * 关闭app
   */
  async safeQuitAppByName(name: string) {
    if (await this.isAppRunning(name)) {
      await jxaUtil.safeQuitApp(name);
      // 等待退出完毕
      await Helper.waitUntil(async () => {
        return !(await this.isAppRunning(name));
      });
    }
  }
}
