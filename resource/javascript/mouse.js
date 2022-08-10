#!/usr/bin/env osascript -l JavaScript

// 控制鼠标的点击（左、右），鼠标拖拽、移动事件
// 使用示例：
// click()
// drag(1068 + 122, 38,1068, 38)
// move(652, 568)

ObjC.import('Cocoa')
ObjC.import('stdlib')
ObjC.import('CoreGraphics')


// 获取鼠标坐标=========================

function location(screenH = 1050) {
    const mouseLoc = $.NSEvent.mouseLocation //获取 鼠标当前的的坐标（浮点数）
    mouseLoc.mx = parseInt(mouseLoc.x)
    mouseLoc.my = screenH - Math.trunc(mouseLoc.y) //坐标需要屏幕高度减获取的坐标
    return mouseLoc
}

// 鼠标的基本操作=========================

const { mx, my } = location()
const left_mouse_down = $.kCGEventLeftMouseDown //鼠标左键按下事件
const right_mouse_down = $.kCGEventRightMouseDown //鼠标左键按下事件
const left_mouse_up = $.kCGEventLeftMouseUp
const right_mouse_up = $.kCGEventRightMouseUp
const left_mouse_drag = $.kCGEventLeftMouseDragged
const mouse_move = $.kCGEventMouseMoved
const mouse_scroll = $.KCGEventScrollWheel

// 用于注册鼠标事件
function mouse_event(event_type, coords) {
    const nil = $()
    // const nil = 10
    // usleep(200000)
    const event = $.CGEventCreateMouseEvent(
        nil,
        event_type,
        coords,
        $.kCGMouseButtonLeft
    )
    $.CGEventPost($.kCGHIDEventTap, event)
    delay(0.01)//添加一点延迟，保证稳定
    // $.CFRelease(event)
}

function down(x = mx, y = my, r = false) {
    const coords = { x: x, y: y } //坐标对象
    const mouse_down = r ? right_mouse_down : left_mouse_down
    mouse_event(mouse_down, coords)
}

function up(x = mx, y = my, r = false) {
    const coords = { x: x, y: y } //坐标对象
    const mouse_up = r ? right_mouse_up : left_mouse_up
    mouse_event(mouse_up, coords)
}

function click(opts = {}) {
    const { x = mx, y = my, r = false } = opts;
    down(x, y, r)
    up(x, y, r)
}

// drag从特定位置按下，拖拽到指定位置
function drag(tx, ty, cx = location().mx, cy = location().my, r = null) {
    const t_coords = { x: tx, y: ty } //拖拽末尾坐标
    console.log('drag:', cx, cy)
    down(cx, cy)
    mouse_event(left_mouse_drag, t_coords)
    delay(0.5)
    up(tx, ty)
}

// move是在鼠标没有点击的状态下进行移动
function move(x, y, r = null) {
    const coords = { x: x, y: y }
    mouse_event(mouse_move, coords)
}

exports.location = location;
exports.click = click;
exports.move = move;
exports.drag = drag;
