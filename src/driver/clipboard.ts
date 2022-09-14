import { jxaUtil } from '../core/jxa/jxaUtil';

export default class ClipboardDriver {
  /**
   * 获取剪切板的文本
   */
  async getClipText(): Promise<string> {
    return jxaUtil.getClipText();
  }

  /**
   * 设置文本到剪切板
   * @param str string
   */
  async setClipText(str: string) {
    return jxaUtil.setClipText(str);
  }
}
