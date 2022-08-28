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
