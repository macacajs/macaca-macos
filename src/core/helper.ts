import os from 'os';
import fs from 'fs';
import npmUpdate from 'npm-update';

const path = require('path');
const shell = require('shelljs');

export class Helper {

  /**
   * 检测4k屏
   */
  static isHdpiDisplay(): boolean {
    const res = shell.exec('system_profiler SPDisplaysDataType | grep Resolution', { silent: true }).stdout.trim();
    if (res) {
      // 多个显示器只关注主显示器
      const main = res.split('\n')[0].trim();
      if (main.includes('Retina')) {
        return true;
      }
      // 一般情况下 4k 高大于等于 2160 像素, 2k达不到这个高度，除非这是个造型很变态的2k显示器...
      // 不用宽度做判断(存在宽屏显示器)
      const mainY = Number.parseInt(main.split(' x ')[1].split(' ')[0]);
      return mainY >= 2160;
    }
    console.log('无显示器信息');
  }

  static async isDeprecated() {
    await npmUpdate({
      pkg: this.getPkg(),
    });
  }

  static getPkg() {
    let pkg: any = {};
    if (__dirname.includes('/dist/src/core')) {
      pkg = require('../../../package.json');
    } else {
      pkg = require('../../package.json');
    }
    return pkg;
  }

  /**
   * 获取版本
   */
  static getPkgVersion(): string {
    const pkg = this.getPkg();
    return pkg.version;
  }

  /**
   * 调试日志
   * @param items
   */
  static debug(...items) {
    if (process.env.MACACA_MACOS_DEBUG) {
      console.log(...items);
    }
  }

  static getResourcePath(): string {
    return path.resolve(__dirname, '../../resource');
  }

  /**
   * 支持每秒打印时间
   * @param ms
   * @param tick
   */
  static async sleep(ms: number, tick = false) {
    if (ms > 10000 && tick) {
      for (let i = 0; (i * 1000) < ms; i++) {
        await this.sleep(1000);
        console.log(`${i}s`);
      }
    } else {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }

  /**
   * 判断是否为异步函数
   * @param func
   */
  static isAsyncFunc(func: Function) {
    return func && typeof func === 'function' && func[Symbol.toStringTag] === 'AsyncFunction';
  }

  static hasUnicode(str: string) {
    for (let i = 0; i < str.length; i++) {
      if (str.charCodeAt(i) > 255) {
        return true;
      }
    }
    return false;
  }

  static tmpdir() {
    // mac 环境需要转换
    if (os.platform() === 'darwin') {
      return fs.realpathSync(os.tmpdir());
    }
    return os.tmpdir();
  }

  /**
   * 等待直到条件方法返回true
   * @param func
   * @param waitMs
   * @param intervalMs
   */
  static async waitUntil(func: Function, waitMs = 5E3, intervalMs = 1E3) {
    const start = Date.now();
    const end = start + waitMs;
    const isAsyncFunc = this.isAsyncFunc(func);
    const fn = () => {
      return new Promise(async (resolve, reject) => {
        const continuation = (res, rej) => {
          const now = Date.now();
          if (now < end) {
            res(this.sleep(intervalMs).then(fn));
          } else {
            const funcStr = func.toString().replace(/ +/g, ' ').replace(/\n/g, '');
            rej(`Wait For Condition: ${funcStr} timeout ${waitMs} ms`);
          }
        };
        let isOk;
        if (isAsyncFunc) {
          isOk = await func().catch(() => {
            continuation(resolve, reject);
          });
        } else {
          isOk = func();
        }
        if (isOk) {
          resolve(true);
        } else {
          continuation(resolve, reject);
        }
      });
    };
    return fn();
  }
}
