// The Swift Programming Language
// https://docs.swift.org/swift-book

import AppKit
import Cocoa

func taskDelay(_ millSeconds: Int, _ task: @escaping () -> Void) {
    DispatchQueue.main.asyncAfter(deadline: .now() + Double(millSeconds) / 1000.0, execute: task)
}

func postMouseEvent(button:CGMouseButton, type:CGEventType, point: CGPoint,clickCount:Int64 = 1)
{
	let event = createMouseEvent(button: button, type: type, point: point,clickCount:clickCount)
	event.post(tap: CGEventTapLocation.cghidEventTap)
}

func createMouseEvent(button:CGMouseButton, type:CGEventType, point: CGPoint,clickCount:Int64 = 1) ->  CGEvent
{
	let event : CGEvent  = CGEvent(mouseEventSource: CGEventSource.init(stateID: CGEventSourceStateID.privateState), mouseType: type, mouseCursorPosition: point, mouseButton: button)!
	event.setIntegerValueField(CGEventField.mouseEventClickState, value: clickCount)
	return event
}

func mouseDragged(point:CGPoint,toPoint:CGPoint,button:CGMouseButton,postDelay:Int){
	let toMaxX:Bool = toPoint.x - point.x > 0
	let toMaxY:Bool = toPoint.y - point.y > 0
	
	var tempPointY = point.y
	var tempPointX = point.x
	
	postMouseEvent(button: button, type: button == .left  ? .leftMouseDown : .rightMouseDown, point: point,clickCount: 1);
	
	let blockOperation = BlockOperation()
	
	blockOperation.addExecutionBlock {
		while toMaxY ? (toPoint.y > tempPointY) : (toPoint.y < tempPointY){
      Thread.sleep(forTimeInterval: 0.0001 * Double(postDelay))
			toMaxY ?  (tempPointY += 1) : (tempPointY -= 1)
			postMouseEvent(button: button, type: button == .left  ? .leftMouseDragged : .rightMouseDragged, point: CGPoint(x: tempPointX, y: tempPointY),clickCount: 1);
		}
	}
	blockOperation.addExecutionBlock {
		while toMaxX ? (toPoint.x > tempPointX) : (toPoint.x < tempPointX) {
      Thread.sleep(forTimeInterval: 0.0001 * Double(postDelay))
			toMaxX ? (tempPointX += 1) : (tempPointX -= 1)
			postMouseEvent(button: button, type: button == .left  ? .leftMouseDragged : .rightMouseDragged, point: CGPoint(x: tempPointX, y: tempPointY),clickCount: 1);
		}
		
	}
	blockOperation.completionBlock = {
		postMouseEvent(button: button, type: button == .left  ? .leftMouseUp : .rightMouseUp, point: toPoint,clickCount: 1);
	}
	blockOperation.start()
}

func printJson(_ data: Any) {
	let jsonData = try! JSONSerialization.data(withJSONObject: data)
    print(String(data: jsonData, encoding: String.Encoding.utf8) ?? "")
}

func main(args: [String]) -> Int32 {
    guard CommandLine.arguments.count == 6 || CommandLine.arguments.count == 4 else {
        fputs(String(format: "usage1: %1$@ postDelay x1 y1 x2 y2, dragged from (x1, y1) to (x1, y2), when move a px, sleep(postDelay)\n", CommandLine.arguments[0]), stderr)
        fputs(String(format: "usage2: %1$@ postDelay x y, dragged from mouseLocation to (mouseLocation.x + x, mouseLocation.y + y), when move a px, sleep(postDelay)\n", CommandLine.arguments[0]), stderr)
        return 1
    }
    let postDelay = Int(args[1]) ?? 0
    var mouseLoc = NSEvent.mouseLocation

    if (CommandLine.arguments.count == 4) {
        mouseLoc.y = NSHeight(NSScreen.screens[0].frame) - mouseLoc.y;
        let newLoc = CGPoint(x: mouseLoc.x+CGFloat(Int(args[2]) ?? 0), y: mouseLoc.y+CGFloat(Int(args[3]) ?? 0)) 
        mouseDragged(
            point: CGPoint(x: mouseLoc.x, y: mouseLoc.y),
            toPoint: newLoc,
            button: .left,
            postDelay: postDelay
        )
        printJson([
            "success": true,
            "from": [ "x1": Int(mouseLoc.x), "y1": Int(mouseLoc.y) ],
            "to": [ "x2": Int(newLoc.x), "y2": Int(newLoc.y) ],
        ])
        return 0
    }

    let x1 = Int(args[2]) ?? Int(mouseLoc.x)
    let y1 = Int(args[3]) ?? Int(mouseLoc.y)
    let x2 = Int(args[4]) ?? Int(mouseLoc.x)
    let y2 = Int(args[5]) ?? Int(mouseLoc.y)

    if (x1 != x2 || y1 != y2) {
        mouseDragged(
            point: CGPoint(x: x1, y: y1),
            toPoint: CGPoint(x: x2, y: y2),
            button: .left,
            postDelay: postDelay
        )
    }
    printJson([
        "success": true,
        "from": [ "x1": x1, "y1": y1 ],
        "to": [ "x2": x2, "y2": y2 ],
    ])
    return 0
}

exit(main(args: CommandLine.arguments))
