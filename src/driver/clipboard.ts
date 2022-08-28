import { jxaUtil } from '../jxa/jxaUtil';

export default class ClipboardDriver {
  async getClipText() {
    return jxaUtil.getClipText();
  }

  async setClipText(str: string) {
    return jxaUtil.setClipText(str);
  }
}
