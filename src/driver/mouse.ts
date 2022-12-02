import robot from 'robotjs';
import { Helper } from '../core/helper';
import { EDriver } from '../core/enums';
import { osaUtil } from '../core/jxa/osaUtil';
import { jxaUtil } from '../core/jxa/jxaUtil';

export default class MouseDriver {
  mouseMoveTo(x: number, y: number) {
    robot.moveMouseSmooth(x, y);
  }

  /**
   * 鼠标点击 当前鼠标所在位置
   * @param opts
   */
  mouseClick(opts: {
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
      const pos = this.mouseGetPos();
      Helper.debug('click', pos);
      return osaUtil.click(pos);
    }
    robot.mouseClick(button, doubleClick);
  }

  async mouseDrag(x: number, y: number) {
    await jxaUtil.drag(x, y);
  }

  mouseGetPos() {
    return robot.getMousePos();
  }

  mouseScroll(x: number, y: number) {
    robot.scrollMouse(x, y);
  }
}
