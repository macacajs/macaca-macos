import shell from 'shelljs';
import robot from 'robotjs';
import fs from 'fs';
import { Helper } from '../core/helper';

export default class ScreenDriver {

  hidpi = Helper.isHdpiDisplay();

  /**
   * 使用系统ocr能力
   */
  screenOcr(opts: {
    picFile?: string;
    rectangle?: string; // 通过矩形框 x,y,width,height
    count?: number; // 支持多次结果合并返回,增强识别率
  } = {}) {
    const { picFile, rectangle, count = 1 } = opts;
    const saveFile = picFile || `${Helper.tmpdir()}/${Date.now()}.png`;
    if (!fs.existsSync(saveFile)) {
      this.screenShot(saveFile, { rectangle });
    }
    const ocrRes = [];
    for (let i = 0; i < count; i++) {
      const resStr = shell.exec(`${Helper.getResourcePath()}/swift/ocr ${saveFile}`, { silent: true }).stdout;
      ocrRes.push(...JSON.parse(resStr));
    }
    return {
      imgFile: saveFile,
      ocrRes,
    };
  }

  /**
   * 获取文案在截图区域的位置
   * @param opts
   */
  getTextsPosition(opts: {
    texts: string[]; // 目标文案
    index?: number; // 重复项指针
    contains?: boolean; // 包含即可
    rectangle?: string; // 截图目标区域 通过矩形框 x,y,width,height 默认全屏
  }) {
    const {
      texts, rectangle,
      index = 0,
      contains = true,
    } = opts;
    // 获取文案位置
    const { ocrRes } = this.screenOcr({ rectangle });
    const resultList = [];
    // 找多个目标
    for (const text of texts) {
      const hitItems = ocrRes.filter(it => {
        return contains ? it.word.includes(text) : it.word.trim() === text;
      });
      // 支持倒数
      const idx = index < 0 ? hitItems.length + index : index;
      const hitItem = hitItems[idx];
      // 相对位置
      if (hitItem) {
        const { left, top, height, width } = hitItem.rect;
        let xx = left + width / 2;
        let yy = top + height / 2;
        if (this.hidpi) {
          xx = xx / 2;
          yy = yy / 2;
        }
        resultList.push({ x: Math.floor(xx), y: Math.floor(yy), word: hitItem.word });
      }
    }
    return resultList;
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
