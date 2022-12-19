import robot from 'robotjs';
import shell from 'shelljs';
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

  /**
   * 从当前位置拖拽到目标位置
   * @param x
   * @param y
   * @param opts
   */
  async mouseDrag(x: number, y: number, opts: {
    driver?: EDriver;
  } = {}) {
    if (opts.driver === EDriver.JXA) {
      await jxaUtil.drag(x, y);
    } else if (opts.driver === EDriver.RobotJs) {
      // Robotjs 存在无法拖动app窗口的问题
      robot.mouseToggle('down');
      robot.dragMouse(x, y);
      robot.mouseToggle('up');
    }
    // default swift
    const curr_pos = this.mouseGetPos();
    shell.exec(`${Helper.getResourcePath()}/swift/mouse-drag 10 ${curr_pos.x} ${curr_pos.y} ${x} ${y}`, { silent: false });
  }

  mouseGetPos() {
    return robot.getMousePos();
  }

  mouseScroll(x: number, y: number) {
    robot.scrollMouse(x, y);
  }
}
