#!/usr/bin/env osascript

on run argv
 set argList to {}
 repeat with arg in argv
  set end of argList to quoted form of arg
 end repeat
 set {TID, text item delimiters} to {text item delimiters, space}
 set argList to argList as text
 set text item delimiters to TID

 tell application "System Events"
  click at {item 1 of argv, item 2 of argv}
 end tell
end run
