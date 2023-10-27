# 1. build MacosOcr project
echo "☕️ start build ocr ..."
cd ./src/MacosOcr
swift build -c release
cd ../../
cp ./src/MacosOcr/.build/release/MacosOcr ./ocr

# 2. build LeftMouseDragged project
echo "☕️ start build mouse-drag ..."
cd ./src/LeftMouseDragged
swift build -c release
cd ../../
cp ./src/LeftMouseDragged/.build/release/LeftMouseDragged ./mouse-drag