// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

// open when coding
// import { Application } from '@jxa/types';
// import '@jxa/global-type';

import { execJxa } from './exec-jxa';
import { Helper } from '../helper';

declare global {
  function Application(name: string): object;

  function Library(name: string): object;

  function Path(name: string): object;

  function requireHack(name: string): object;

  function delay(delay?: number): void;

  const ObjC: any;
  const $: any;
}

export const jxaUtil = {
  /**
   * 设置剪贴板内容
   * @param str
   */
  async setClipText(str: string) {
    await execJxa((str) => {
      const app = Application.currentApplication();
      app.includeStandardAdditions = true;
      return app.setTheClipboardTo(str || '[NONE]');
    }, [ str ]);
  },

  async getClipText() {
    const res: any = await execJxa(() => {
      const app = Application.currentApplication();
      app.includeStandardAdditions = true;
      return app.theClipboard();
    }, []);
    Helper.debug('clipText:', res);
    return res;
  },

  /**
   * 键盘按键和组合键
   * https://eastmanreference.com/complete-list-of-applescript-key-codes
   * @param key
   * @param modified command | option | control | shift
   */
  async keyTap(key: string | number, modified: string[] = []) {
    // keyCode
    if (typeof key === 'number') {
      await execJxa((key, modified) => {
        const sys = Application('System Events');
        sys.keyCode(key, {
          using: modified.map(it => {
            return `${it} down`;
          }),
        });
      }, [ key, modified ]);
    } else {
      await execJxa((key, modified) => {
        const sys = Application('System Events');
        sys.keystroke(key, {
          using: modified.map(it => {
            return `${it} down`;
          }),
        });
      }, [ key, modified ]);
    }
  },

  /**
   * 字符串输入
   * - 不支持Unicode字符
   * @param str
   * @param delay
   */
  async typeString(str, delay = false) {
    if (delay) {
      await execJxa((str) => {
        const sys = Application('System Events');
        for (let i = 0; i < str.length; i++) {
          sys.keystroke(str[i]);
          delay(0.1);
        }
      }, [ str ]);
    } else {
      await execJxa((str) => {
        const sys = Application('System Events');
        sys.keystroke(str);
      }, [ str ]);
    }
  },

  /**
   * 关闭app
   */
  async safeQuitApp(appName: string) {
    await execJxa((appName) => {
      const app = Application(appName);
      if (app.running()) {
        app.quit();
      }
    }, [ appName ]);
  },

  /**
   * 窗口重定位(默认左上角)
   * @param opts
   */
  async resizePosition(opts: {
    name: string;
    topLeftX?: number;
    topLeftY?: number;
    width: number;
    height: number;
  }) {
    opts.topLeftX = opts.topLeftX || 0;
    opts.topLeftY = opts.topLeftY || 0;
    await execJxa((opts) => {
      const window = Library('window');
      const app = Application(opts.name);
      if (app.running()) {
        app.activate();
        window.sizePosition(opts.name, opts.topLeftX, opts.topLeftY, opts.width, opts.height);
      }
    }, [ opts ]);
  },

  /**
   * 获取当前系统用户信息
   */
  async getUserName() {
    const res: any = await execJxa(() => {
      const sys = Application('System Events');
      return sys.currentUser().name();
    }, []);
    return res;
  },

  /**
   * app运行状态
   * @param appName
   */
  async isAppRunning(appName: string) {
    const res: boolean = await execJxa((appName) => {
      return Application(appName).running();
    }, [ appName ]);
    return res;
  },

  /**
   * 对话框, 接受用户输入并返回
   */
  async prompt(message: string): Promise<string> {
    return execJxa((msg) => {
      const app = Application.currentApplication();
      app.includeStandardAdditions = true;
      try {
        return app.displayDialog(msg, { defaultAnswer: '' }).textReturned;
      } catch (e) {
        return null;
      }
    }, [ message ]);
  },

  /**
   * 告警
   * @param title
   * @param msg
   * @param type
   */
  async alert(title: string, msg: string, type = 'info'): Promise<string> {
    let icon;
    if (type === 'warn') {
      icon = '⚠️';
    } else if (type === 'error') {
      icon = '❌';
    } else {
      icon = '🤖';
    }
    const message = `${icon} ${type}: ${msg}`;
    return execJxa((title, msg) => {
      const app = Application.currentApplication();
      app.includeStandardAdditions = true;
      app.displayAlert(title, { message: msg });
    }, [ title, message ]);
  },

  async confirm(msg: string): Promise<string> {
    return execJxa((msg) => {
      const app = Application.currentApplication();
      app.includeStandardAdditions = true;
      try {
        app.displayDialog(msg);
        return true;
      } catch (e) {
        return false;
      }
    }, [ msg ]);
  },

  /**
   * 浏览器可以
   * ⚠️ electron app 似乎获取不到窗口ID
   * @param appName 'Google Chrome' | 'Safari' | 'Firefox'
   */
  async getWindowIdByAppName(appName: string) {
    const res: any = await execJxa((appName) => {
      const app = Application(appName);
      app.includeStandardAdditions = true;
      if (app.running()) {
        app.activate();
        if (app.windows[0]) {
          const window = app.windows[0];
          return window.id();
        }
        return app.id();
      }
    }, [ appName ]);
    Helper.debug(res);
    return res;
  },

  /**
   * 激活聚焦
   * @param appName
   */
  async focusApp(appName: string) {
    await execJxa((appName) => {
      const app = Application(appName);
      app.includeStandardAdditions = true;
      if (app.running()) {
        app.activate();
      }
    }, [ appName ]);
  },

  /**
   * 鼠标操作(默认当前位置左键)
   * - 不稳定，会失效
   */
  async click(opts: {
    x: number;
    y: number;
    r?: boolean;
  } = {}) {
    const mouseLib = `${Helper.getResourcePath()}/javascript/mouse.js`;
    await execJxa((lib, opts) => {
      const mouse = requireHack(lib);
      mouse.click(opts);
    }, [ mouseLib, opts ]);
  },
};
