import fs from 'fs';
import { jxaUtil } from './jxa/jxaUtil';
import { Helper } from './helper';
import { EDriver } from './enums';
import { osaUtil } from './jxa/osaUtil';

const shell = require('shelljs');
const robot = require('robotjs');

export class MacacaMacOS {
  recordingVideoFile;

  startApp(appFileDir) {
    return shell.exec(`open ${appFileDir}`, { silent: true });
  }

  getPixelColor(x, y) {
    return robot.getPixelColor(x, y);
  }

  async getClipText() {
    return jxaUtil.getClipText();
  }

  /**
   * 仅返回第一个窗口
   * @param name
   */
  async getAppSizePosition(name: string) {
    const ress = await jxaUtil.getAllAppSizePosition();
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

  async isAppRunning(name: string) {
    return jxaUtil.isAppRunning(name);
  }

  async focusApp(name: string, opts: {
    driver?: EDriver;
  } = {}) {
    const {
      driver = EDriver.RobotJs,
    } = opts;
    if (driver === EDriver.AppleScript) {
      return jxaUtil.asSafeActivate(name);
    }
    // default
    return jxaUtil.focusApp(name);
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

  async resizePosition(opts: {
    name: string;
    topLeftX?: number;
    topLeftY?: number;
    width: number;
    height: number;
  }) {
    await Helper.waitUntil(async () => {
      return this.getAppSizePosition(opts.name);
    }, 10E3);
    await jxaUtil.resizePosition(opts);
  }

  screenCaptureBuffer(area: {
    topLeftX: number;
    topLeftY: number;
    width: number;
    height: number;
  }) {
    const img = robot.screen.capture(area.topLeftX, area.topLeftY, area.width, area.height);
    return img.image;
  }

  /**
   * 截图
   * @param picFile
   * @param opts
   */
  screenShot(picFile: string, opts: {
    rename?: string;
    rectangle?: string; // 通过矩形框 x,y,width,height
  } = {}) {
    const { rectangle } = opts;
    let cmd = 'screencapture -x -r';
    if (rectangle) {
      cmd += ` -R ${rectangle}`;
    }
    cmd += ` ${picFile}`;
    shell.exec(cmd);
    return picFile;
  }

  /**
   * 开始录像，返回mov文件路径
   * @param opts
   */
  startVideo(opts: {
    movFile?: string; // 指定保存的mov文件
    rectangle?: string; // 通过矩形框 x,y,width,height
    seconds?: number; // 指定时长
  } = {}) {
    if (this.recordingVideoFile) {
      console.error('存在录制中的录像');
      return;
    }
    const { rectangle, seconds, movFile } = opts;
    // 静音 录像 显示点击
    let args = [
      '-x',
      '-r',
      '-v',
      '-k',
    ];
    if (rectangle) {
      args = args.concat([
        '-R',
        rectangle,
      ]);
    }
    if (seconds) {
      args = args.concat([
        '-V',
        `${seconds}`,
      ]);
    }
    const saveFile = movFile || `${Helper.tmpdir()}/${Date.now()}.mov`;
    args.push(saveFile);
    const cmd = `screencapture ${args.join(' ')}`;
    shell.exec(cmd, { silent: true, async: true });
    this.recordingVideoFile = saveFile;
  }

  /**
   * 结束当前录像
   * - FIXME robotJs 鼠标点击不会被录下来, 尝试jxa版本
   * @param destFile
   */
  async saveVideo(destFile?: string): Promise<string> {
    if (
      destFile
      && !destFile.endsWith('.mov')
      && !destFile.endsWith('.mp4')
    ) {
      console.error('仅支持mov和mp4格式');
      return;
    }
    // 结束录制
    const movFile = this.recordingVideoFile;
    this.recordingVideoFile = null;
    if (!movFile) {
      console.error('未开始录像');
      return;
    }
    await this.keyboardTap('escape', [ 'command', 'control' ]);
    await Helper.waitUntil(() => {
      return fs.existsSync(movFile);
    });
    if (destFile) {
      // ffmpeg 转换
      if (destFile.endsWith('.mp4')) {
        const cmd = `ffmpeg -i ${movFile} -vcodec h264 -an -crf 20 -preset ultrafast -strict -2  -y ${destFile}`;
        shell.exec(cmd, { silent: true });
      } else {
        shell.cp(movFile, destFile);
      }
      return destFile;
    }
    return movFile;
  }

  mouseMoveTo(x: number, y: number) {
    robot.moveMouseSmooth(x, y);
  }

  /**
   * 鼠标点击
   * @param opts
   */
  mouseClick(opts: {
    use?: string;
    button?: string; // left | middle | right
    doubleClick?: boolean; // for robotJs only
    driver?: EDriver;
  } = {}) {
    const {
      driver = EDriver.RobotJs,
      button = 'left',
      doubleClick = false,
    } = opts;
    if (driver === EDriver.AppleScript) {
      return osaUtil.click(this.mouseGetPos());
    }
    robot.mouseClick(button, doubleClick);
  }

  mouseDrag(x: number, y: number) {
    robot.dragMouse(x, y);
  }

  mouseGetPos() {
    return robot.getMousePos();
  }

  mouseScroll(x: number, y: number) {
    robot.scrollMouse(x, y);
  }

  screenGetSize() {
    return robot.getScreenSize();
  }

  /**
   * 字符串输入
   * @param str
   * @param delay
   * @param robotJs
   */
  async keyboardTypeString(str: string, delay = false, robotJs = false) {
    const hasUnicode = Helper.hasUnicode(str);
    if (robotJs) {
      // 已知问题
      // ⚠️ robotJs 在 keyTap 执行之后会不稳定
      if (!hasUnicode && delay) {
        // delay 不支持中文delay输入
        await robot.typeStringDelayed(str, 5E3);
      } else {
        // 支持中文
        robot.typeString(str);
      }
    } else {
      if (hasUnicode) {
        const temp = await jxaUtil.getClipText();
        await jxaUtil.setClipText(str);
        await this.keyboardTap('v', [ 'command' ]);
        await this.keyboardTap('right');
        await jxaUtil.setClipText(temp); // 恢复
      } else {
        await jxaUtil.typeString(str, delay);
      }
    }
  }

  /**
   * @param key
   * @param modified
   */
  async keyboardTap(key: string, modified: string[] = []) {
    robot.keyTap(key, modified);
  }

}
