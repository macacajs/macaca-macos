# 1. clean dist
rm -rf ./dist

# 2. tsc compile 
`npm bin`/tsc

# 3. move resouce
cp -r ./resource ./dist/resource

# 4. replace ts-node
grep -rl 'ts-node' ./dist/bin | xargs sed -i '' 's/ts-node/node/g'
