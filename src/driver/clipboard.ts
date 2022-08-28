import { jxaUtil } from '../jxa/jxaUtil';

export default class ClipboardDriver {
  /**
   * 获取剪切板的文本
   * @returns string
   */
  async getClipText() {
    return jxaUtil.getClipText();
  }

  /**
   * 设置文本到剪切板
   * @param str string
   * @returns string
   */
  async setClipText(str: string) {
    return jxaUtil.setClipText(str);
  }
}
