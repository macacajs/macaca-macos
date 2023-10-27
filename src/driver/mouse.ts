import robot from 'robotjs';
import shell from 'shelljs';
import { Helper } from '../core/helper';
import { EDriver } from '../core/enums';
import { osaUtil } from '../core/jxa/osaUtil';
import { jxaUtil } from '../core/jxa/jxaUtil';
import ScreenDriver from './screen';
import os from 'os';
import assert from 'assert';
import fs from 'fs';

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
   * 点击屏幕/目标区域的文案
   * 依赖 ocr
   * @param opts
   */
  async mouseClickText(opts: {
    text: string; // 目标文案
    index?: number; // 重复项指针
    rectangle?: string; // 截图目标区域 通过矩形框 x,y,width,height 默认全屏
    clickOpts?: any;
    shiftX?: number; // 偏移量
    shiftY?: number;
  }) {
    const {
      text, index, rectangle,
      clickOpts = {},
      shiftX = 0,
      shiftY = 0,
    } = opts;
    const res = await new ScreenDriver().getTextsPosition({
      texts: [ text ],
      index,
      rectangle,
    });
    if (res.length) {
      let { x, y } = res[0];
      // 绝对位置
      if (rectangle) {
        x = Number.parseInt(rectangle.split(',')[0]) + x;
        y = Number.parseInt(rectangle.split(',')[1]) + y;
      }
      // 偏移
      x = x + shiftX;
      y = y + shiftY;
      this.mouseMoveTo(x, y);
      this.mouseClick(clickOpts);
      return true;
    }
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
    const cmdFile = `${Helper.getResourcePath()}/swift/mouse-drag-${os.arch()}`;
    assert(fs.existsSync(cmdFile), `不支持的架构: ${os.arch()}`);
    shell.exec(`${cmdFile} 10 ${curr_pos.x} ${curr_pos.y} ${x} ${y}`, { silent: true });
  }

  mouseGetPos() {
    return robot.getMousePos();
  }

  mouseScroll(x: number, y: number) {
    robot.scrollMouse(x, y);
  }
}
