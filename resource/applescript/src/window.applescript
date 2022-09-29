#!/usr/bin/env osascript

-- 之所以有两种方法，是因为这两种方法并非总是生效的，具体软件具体情况不同
-- 移动窗口
on moveBounds(name, topLeftX, topLeftY, bottomRightX, bottomRightY)
  tell application name
    set bounds of front window to {topLeftX, topLeftY, bottomRightX, bottomRightY}
  end tell
end moveBounds

-- 设置窗口位置和大小 通过重定位
on sizePosition(name, topLeftX, topLeftY, width, height)
  tell application "System Events" to tell application process name
    tell window 1
      set {position, size} to {{topLeftX, topLeftY}, {width, height}}
    end tell
  end tell
end sizePosition

-- 设置窗口位置
on setPosition(name, topLeftX, topLeftY)
  tell application "System Events" to tell application process name
    tell window 1
      set {position} to {{topLeftX, topLeftY}}
    end tell
  end tell
end setPosition
