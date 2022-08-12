# applescript

- src 目录
  - 脚本源码，(部分脚本无法直接执行需要通过 系统脚本编辑器软件 编译后执行)
  - 部分可通过 osaUtil 直接执行
- scpt 目录
  - 使用 Mac系统脚本编辑器软件保存的脚本(已经过编译，可直接通过命令行运行)
  - shell方式 osascript ${file} ...args
- scptd 目录
  - 使用 Mac系统脚本编辑器软件 导出的脚本包(经过编译，可通过jxa Library引用)
  - jxa方式 const window = Library('window');

---

- 如需通过Library 使用 请将scptd目录下的文件拷贝至 ~/Library/Script Libraries 目录
