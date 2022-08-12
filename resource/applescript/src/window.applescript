#!/usr/bin/env osascript

-- 之所以有两种方法，是因为这两种方法并非总是生效的，具体软件具体情况不同，请使用时自行选用
-- 移动窗口
on moveBounds(name, topLeftX, topLeftY, bottomRightX, bottomRightY)
  tell application name
    set bounds of front window to {topLeftX, topLeftY, bottomRightX, bottomRightY}
  end tell
end moveBounds

-- 移动窗口 通过重定位
on sizePosition(name, topLeftX, topLeftY, width, height)
  tell application "System Events" to tell application process name
    tell window 1
      set {position, size} to {{topLeftX, topLeftY}, {width, height}}
    end tell
  end tell
end sizePosition


-- 获取所有app的长宽和位置
on getAllAppSizePosition()
  tell application "System Events"
    set _P to a reference to (processes whose background only = false)
    set _W to a reference to windows of _P
    set res to [_P's name, _W's size, _W's position]
    return res
  end tell
end getAllAppSizePosition

-- 激活app直到app窗口ready
on safeActivate(appName)
tell application appName to activate
  tell application "System Events"
    tell process appName
      repeat until window 1 exists
      -- 直到应用的一个窗口存在之前，不停循环这段空语句
      end repeat
    end tell
  end tell
end safeActivate

