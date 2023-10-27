// The Swift Programming Language
// https://docs.swift.org/swift-book

import Cocoa
import Vision
// import ArgumentParser

// https://developer.apple.com/documentation/vision/vnrecognizetextrequest

let MODE: VNRequestTextRecognitionLevel = VNRequestTextRecognitionLevel.accurate // or .fast
let USE_LANG_CORRECTION = false
var REVISION:Int
if #available(macOS 13, *) {
    REVISION = VNRecognizeTextRequestRevision3
} else if #available(macOS 11, *) {
    REVISION = VNRecognizeTextRequestRevision2
} else {
    REVISION = VNRecognizeAnimalsRequestRevision1
}

func main(args: [String]) -> Int32 {
    guard CommandLine.arguments.count == 2 else {
        fputs(String(format: "usage: %1$@ image\n", CommandLine.arguments[0]), stderr)
        return 1
    }

    let src = args[1]

    guard let img = NSImage(byReferencingFile: src) else {
        fputs("Error: failed to load image '\(src)'\n", stderr)
        return 1
    }

    guard let imgRef = img.cgImage(forProposedRect: &img.alignmentRect, context: nil, hints: nil) else {
        fputs("Error: failed to convert NSImage to CGImage for '\(src)'\n", stderr)
        return 1
    }

    let request: VNRecognizeTextRequest = VNRecognizeTextRequest { (request, error) in
        let observations: [VNRecognizedTextObservation] = request.results as? [VNRecognizedTextObservation] ?? []
        var results: [Any] = []
        for observation: VNRecognizedTextObservation in observations {
          let candidate: VNRecognizedText = observation.topCandidates(1)[0]
          let value = [
            "word": candidate.string,
            "rect": [
              "left": Int(Float(observation.topLeft.x) * Float(imgRef.width)),
              "top": Int(Float(1 - observation.topLeft.y) * Float(imgRef.height)),
              "width": Int(Float(observation.topRight.x - observation.topLeft.x) * Float(imgRef.width)),
              "height": Int(Float(observation.topLeft.y - observation.bottomLeft.y) * Float(imgRef.height)),
            ],
            "confidence": candidate.confidence,
          ]
          results.append(value)
        }
        let data = try! JSONSerialization.data(withJSONObject: results)
        print(String(data: data, encoding: String.Encoding.utf8) ?? "")
    }
    request.recognitionLevel = MODE
    request.usesLanguageCorrection = USE_LANG_CORRECTION
    request.revision = REVISION
    request.recognitionLanguages = ["zh-Hans", "en-US"]
    //request.minimumTextHeight = 0
    //request.customWords = [String]

    try? VNImageRequestHandler(cgImage: imgRef, options: [:]).perform([request])
    return 0
}

exit(main(args: CommandLine.arguments))

// struct Banner: ParsableCommand {
//     static let configuration = CommandConfiguration(
//         abstract: "A Swift command-line tool to manage blog post banners",
//         subcommands: [Generate.self])

//     init() { }
// }

// // Banner.main()

// struct Generate: ParsableCommand {

//     public static let configuration = CommandConfiguration(abstract: "Generate a blog post banner from the given input")

//     @Argument(help: "The title of the blog post")
//     private var title: String

//     @Option(name: .shortAndLong, default: nil, help: "The week of the blog post as used in the file name")
//     private var week: Int?

//     @Flag(name: .long, help: "Show extra logging for debugging purposes")
//     private var verbose: Bool

//     func run() throws {
//         if verbose {
//             let weekDescription = week.map { "and week \($0)" }
//             print("Creating a banner for title \"\(title)\" \(weekDescription ?? "")")
//         }
//     }
// }
