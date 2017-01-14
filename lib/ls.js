const path = require('path')
const fs = require('fs')
const Promise = require('bluebird')
const baseDir = path.resolve(__dirname, process.argv[2] || '.')

Promise.promisifyAll(fs)

const ls = baseDir => {
  const iterate = dir => fs.readdirAsync(dir)
    .filter(file => !(/node_modules/.test(file)))
    .map(file => path.join(dir, file))
    .reduce((files, file) => fs.statAsync(file)
      .then(stat => (stat.isDirectory() ? iterate(file) : file))
      .then(result => files.concat(result))
      , [])
  return iterate(baseDir)
    .map(file => path.relative(baseDir, file))
    .then(files => files.sort())
}

ls(baseDir)
  .then(result => {
    console.log(result.join('\n'))
  })
