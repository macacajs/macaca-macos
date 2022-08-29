import fs from 'fs';
import shell from 'shelljs';
import { Helper } from '../core/helper';
import mixin from '../core/mixin';
import KeyboardDriver from './keyboard';

class VideoDriver {
  recordingVideoFile: string;
  /**
   * 开始录像，返回mov文件路径
   * @param opts
   */
  startVideo(opts: {
    movFile?: string; // 指定保存的mov文件
    rectangle?: string; // 通过矩形框 x,y,width,height
    seconds?: number; // 指定时长
  } = {}) {
    if (this.recordingVideoFile) {
      console.error('存在录制中的录像');
      return;
    }
    const { rectangle, seconds, movFile } = opts;
    // 静音 录像 显示点击
    let args = [
      '-x',
      '-r',
      '-v',
      '-k',
    ];
    if (rectangle) {
      args = args.concat([
        '-R',
        rectangle,
      ]);
    }
    if (seconds) {
      args = args.concat([
        '-V',
        `${seconds}`,
      ]);
    }
    const saveFile = movFile || `${Helper.tmpdir()}/${Date.now()}.mov`;
    args.push(saveFile);
    const cmd = `screencapture ${args.join(' ')}`;
    shell.exec(cmd, { silent: true, async: true });
    this.recordingVideoFile = saveFile;
  }

  /**
   * 结束当前录像
   * - FIXME robotJs 鼠标点击不会被录下来, 尝试jxa版本
   * @param destFile
   */
  async saveVideo(destFile?: string): Promise<string> {
    if (
      destFile
      && !destFile.endsWith('.mov')
      && !destFile.endsWith('.mp4')
    ) {
      console.error('仅支持mov和mp4格式');
      return;
    }
    // 结束录制
    const movFile = this.recordingVideoFile;
    this.recordingVideoFile = null;
    if (!movFile) {
      console.error('未开始录像');
      return;
    }
    await this.keyboardTap('escape', [ 'command', 'control' ]);
    await Helper.waitUntil(() => {
      return fs.existsSync(movFile);
    });
    if (destFile) {
      // ffmpeg 转换
      if (destFile.endsWith('.mp4')) {
        const cmd = `ffmpeg -i ${movFile} -vcodec h264 -an -crf 20 -preset ultrafast -strict -2  -y ${destFile}`;
        shell.exec(cmd, { silent: true });
      } else {
        shell.cp(movFile, destFile);
      }
      return destFile;
    }
    return movFile;
  }
}

interface VideoDriver extends KeyboardDriver {}

mixin(VideoDriver, [
  KeyboardDriver,
]);

export default VideoDriver;
