import mixin from './mixin';
import AppDriver from './driver/app';
import MouseDriver from './driver/mouse';
import KeyboardDriver from './driver/keyboard';
import ClipboardDriver from './driver/clipboard';
import VideoDriver from './driver/video';
import ScreenDriver from './driver/screen';

class MacacaMacOS {}

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
