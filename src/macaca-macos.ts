import robot from 'robotjs';
import { jxaUtil } from './jxa/jxaUtil';
import { Helper } from './helper';
import { osaUtil } from './jxa/osaUtil';
import mixin from './mixin';
import AppDriver from './driver/app';
import MouseDriver from './driver/mouse';
import KeyboardDriver from './driver/keyboard';
import ClipboardDriver from './driver/clipboard';
import VideoDriver from './driver/video';
import ScreenDriver from './driver/screen';

class MacacaMacOS {
  getPixelColor(x, y) {
    return robot.getPixelColor(x, y);
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
}

interface MacacaMacOS extends AppDriver, MouseDriver, KeyboardDriver, ClipboardDriver, VideoDriver, ScreenDriver {}

mixin(MacacaMacOS, [
  AppDriver,
  MouseDriver,
  KeyboardDriver,
  ClipboardDriver,
  VideoDriver,
  ScreenDriver,
]);

export default MacacaMacOS;
