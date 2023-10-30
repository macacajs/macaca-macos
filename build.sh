# 1. clean dist
rm -rf ./dist

# 2. tsc compile
`npm bin`/tsc

# 3. move resource
cp -r ./resource ./dist/resource

# 4. delete unused resource files
rm -rf ./dist/resource/swift/src
rm -rf ./dist/resource/swift/build.sh

# 4. replace ts-node to node
grep -rl 'ts-node' ./dist/bin | xargs sed -i '' 's/ts-node/node/g'
