import fs from 'fs';
import { jxaUtil } from './jxa/jxaUtil';
import { Helper } from './helper';

const shell = require('shelljs');
const robot = require('robotjs');

export class MacacaMacOS {

  async startApp(appFileDir) {
    return shell.exec(`open ${appFileDir}`, { silent: true });
  }

  getPixelColor(x, y) {
    return robot.getPixelColor(x, y);
  }

  getMousePos() {
    return robot.getMousePos();
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

  async focusApp(name: string) {
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
  }) {
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
   * 开始录像，返回pid
   * @param videoFile
   * @param opts
   */
  startVideo(videoFile: string, opts: {
    rename?: string;
    rectangle?: string; // 通过矩形框 x,y,width,height
    seconds?: number; // 指定时长
  }) {
    const { rectangle, seconds } = opts;
    // 静音 录像 显示点击
    let cmd = 'screencapture -x -r -v -k';
    if (rectangle) {
      cmd += ` -R ${rectangle}`;
    }
    if (seconds) {
      cmd += ` -V ${seconds}`;
    }
    cmd += ` ${videoFile}`;
    const child = shell.exec(cmd, { silent: true, async: true });
    if (child.pid) {
      return child.pid;
    }
  }

  /**
   * 结束当前录像
   * - 转换录像格式为mp4
   * - FIXME robotJs 鼠标点击不会被录下来, 尝试jxa版本
   */
  async saveVideo(videoFile: string, mp4 = false): Promise<string> {
    // 结束录制
    await this.keyboardTap('escape', [ 'command', 'control' ]);
    await Helper.waitUntil(() => {
      return fs.existsSync(videoFile);
    });
    if (mp4) {
      // ffmpeg 转换
      const fileMp4 = `${videoFile.substring(0, videoFile.lastIndexOf('.'))}.mp4`;
      const cmd = `ffmpeg -i ${videoFile} -vcodec h264 -an -crf 20 -preset ultrafast -strict -2  -y ${fileMp4}`;
      shell.exec(cmd, { silent: true });
      return fileMp4;
    }
    return videoFile;
  }

  mouseMoveTo(x: number, y: number) {
    robot.moveMouseSmooth(x, y);
  }

  /**
   * 鼠标点击
   * @param bt left | middle | right
   * @param double
   */
  mouseClick(bt = 'left', double?: boolean) {
    robot.mouseClick(bt, double);
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
