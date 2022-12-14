import shell from 'shelljs';
import robot from 'robotjs';
import fs from 'fs';
import { Helper } from '../core/helper';

export default class ScreenDriver {

  /**
   * 使用系统ocr能力
   */
  screenOcr(opts: {
    picFile?: string;
    rectangle?: string; // 通过矩形框 x,y,width,height
  } = {}) {
    const { picFile, rectangle } = opts;
    const saveFile = picFile || `${Helper.tmpdir()}/${Date.now()}.png`;
    if (!fs.existsSync(saveFile)) {
      this.screenShot(saveFile, { rectangle });
    }
    const resStr = shell.exec(`${Helper.getResourcePath()}/swift/ocr ${saveFile}`, { silent: true }).stdout;
    return {
      imgFile: saveFile,
      ocrRes: JSON.parse(resStr),
    };
  }

  screenGetSize() {
    return robot.getScreenSize();
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

  getPixelColor(x, y) {
    return robot.getPixelColor(x, y);
  }
}
