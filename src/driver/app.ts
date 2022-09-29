import shell from 'shelljs';
import { Helper } from '../core/helper';
import { EDriver } from '../core/enums';
import { osaUtil } from '../core/jxa/osaUtil';
import { jxaUtil } from '../core/jxa/jxaUtil';

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

  /**
   * 仅返回第一个窗口
   * @param name
   */
  async getAppSizePosition(name: string) {
    const ress = await osaUtil.getAllAppSizePosition();
    const res = ress.find(it => {
      return it.name === name;
    });
    if (res && res.position.length > 0) {
      return {
        topLeftX: res.position[0][0],
        topLeftY: res.position[0][1],
        width: res.size[0][0],
        height: res.size[0][1],
      };
    }
  }

  /**
   * 设置app窗口位置
   * @param opts
   */
  async resizePosition(opts: {
    name: string;
    topLeftX?: number;
    topLeftY?: number;
    width?: number;
    height?: number;
  }) {
    // app 窗口存在
    await Helper.waitUntil(async () => {
      return this.getAppSizePosition(opts.name);
    }, 10E3);
    await jxaUtil.resizePosition(opts);
  }
}
