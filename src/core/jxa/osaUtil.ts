import { Helper } from '../helper';

const applescript = require('applescript');
const shell = require('shelljs');
const scptDir = `${Helper.getResourcePath()}/applescript/scpt`;

// 直接执行 AppleScript 脚本/脚本包
export const osaUtil = {

  async execAppleScriptStr(funcStr: string): Promise<any> {
    return new Promise((resolve, reject) => {
      applescript.execString(funcStr, (err, rtn) => {
        if (err) {
          console.error(err);
          reject('Something went wrong!');
        }
        resolve(rtn);
      });
    });
  },

  /**
   * 文件要求以 applescript 结尾的源码
   * @param file
   * @param args
   */
  async execAppleScriptFile(file: string, args = []): Promise<any> {
    if (!file.endsWith('.applescript')) {
      console.error('只支持applescript格式文件');
      return;
    }
    return new Promise((resolve, reject) => {
      applescript.execFile(file, args, (err, rtn) => {
        if (err) {
          console.error(err);
          reject('Something went wrong!');
        }
        resolve(rtn);
      });
    });
  },

  /**
   * 执行scpt文件
   */
  execScptFile(file: string, args = []) {
    if (!file.endsWith('.scpt')) {
      console.error('只支持scpt格式文件');
      return;
    }
    shell.chmod('+x', file);
    const cmd = `osascript '${file}' ${args.join(' ')} -ss`;
    Helper.debug(cmd);
    const res = shell.exec(cmd, { silent: true }).stdout;
    Helper.debug(res);
    return res;
  },

  /**
   * applescript 实现
   * jxa运行applescript lib会有问题 只能通过shell执行
   * - 适用原生MacOS的应用（实际点击的是坐标所在的UI元素）,不适用Electron
   * - FIXME 似乎只能点击到到执行脚本的应用窗口，否则卡死
   * @param opts
   */
  click(opts: {
    x: number;
    y: number;
  }) {
    Helper.debug(opts);
    this.execScptFile(`${scptDir}/mouseClick.scpt`, [ opts.x, opts.y ]);
  },

  /**
   * 隐藏所有APP(显示桌面)
   */
  async hideAllApp() {
    await this.execAppleScriptStr(`
tell application "Finder"
    set visible of every process whose visible is true and name is not "Finder" to false
    set the collapsed of windows to true
end tell
    `);
  },

  /**
   * 启动app
   * @param name
   */
  async safeLaunchApp(name: string) {
    await this.execAppleScriptStr(`
set appName to "${name}"
set startIt to false
tell application "System Events"
    if not (exists process appName) then
        set startIt to true
    else if frontmost of process appName then
        set visible of process appName to false
    else
        set frontmost of process appName to true
    end if
end tell
if startIt then
  tell application appName to activate
end if
    `);
  },

  async focusApp(name: string) {
    await this.execAppleScriptStr(`
tell application "${name}"
  reopen
  activate
end tell
    `);
  },

  /**
   * 获取所有app的位置和长宽
   * - 不可见的窗口无法查到
   * - 一个app可能会有多个窗口
   */
  async getAllAppSizePosition() {
    const res = await this.execAppleScriptStr(`
tell application "System Events"
    set _P to a reference to (processes whose background only = false)
    set _W to a reference to windows of _P
    set res to [_P's name, _W's size, _W's position]
    return res
end tell
    `);
    const result = [];
    const names = res[0];
    const sizes = res[1];
    const positions = res[2];
    for (let i = 0; i < names.length; i++) {
      result.push({
        name: names[i],
        size: sizes[i],
        position: positions[i],
      });
    }
    return result;
  },
};
