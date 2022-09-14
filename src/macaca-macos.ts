import mixin from './core/mixin';
import AppDriver from './driver/app';
import MouseDriver from './driver/mouse';
import KeyboardDriver from './driver/keyboard';
import ClipboardDriver from './driver/clipboard';
import VideoDriver from './driver/video';
import ScreenDriver from './driver/screen';
import { jxaUtil } from './core/jxa/jxaUtil';
import { osaUtil } from './core/jxa/osaUtil';
import NetworkDriver from './driver/network';

class MacacaMacOS {
  static jxaUtil = jxaUtil;
  static osaUtil = osaUtil;
}

interface MacacaMacOS extends AppDriver, MouseDriver, KeyboardDriver, ClipboardDriver, VideoDriver, ScreenDriver, NetworkDriver {}

mixin(MacacaMacOS, [
  AppDriver,
  MouseDriver,
  KeyboardDriver,
  ClipboardDriver,
  VideoDriver,
  ScreenDriver,
  NetworkDriver,
]);

export default MacacaMacOS;
