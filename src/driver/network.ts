import shell from 'shelljs';
import { Helper } from '../core/helper';

export default class NetworkDriver {
  wifiDeviceName;
  /**
   * 获取wifi设备名
   * macos 一般为 en0 或 en1
   */
  getWifiDeviceName(): string {
    if (this.wifiDeviceName) {
      return this.wifiDeviceName;
    }
    const name = shell.exec('networksetup -listnetworkserviceorder | sed -n \'/Wi-Fi/s|.*Device: \\(.*\\)).*|\\1|p\'', { silent: true }).stdout;
    Helper.debug(name);
    this.wifiDeviceName = name.trim();
    return this.wifiDeviceName;
  }

  wifiTurnOff() {
    const cmd = `networksetup -setairportpower ${this.getWifiDeviceName()} off`;
    shell.exec(cmd, { silent: true });
  }

  wifiTurnOn() {
    const cmd = `networksetup -setairportpower ${this.getWifiDeviceName()} on`;
    shell.exec(cmd, { silent: true });
  }

  /**
   * wifi 状态获取
   */
  isWifiOn(): boolean {
    // Wi-Fi Power (en0): On
    const cmd = `networksetup -getairportpower ${this.getWifiDeviceName()}`;
    const status = shell.exec(cmd, { silent: true }).stdout;
    Helper.debug(`wifi status: ${status.trim()}`);
    return !!status.includes('On');
  }

  /**
   * 转换开关状态
   */
  wifiToggle() {
    const name = this.getWifiDeviceName();
    const cmd = `networksetup -getairportpower ${name} | grep "On" && networksetup -setairportpower ${name} off || networksetup -setairportpower ${name} on`;
    shell.exec(cmd, { silent: true });
  }
}
