import robot from 'robotjs';
import { jxaUtil } from '../core/jxa/jxaUtil';
import { Helper } from '../core/helper';

export default class KeyboardDriver {
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
