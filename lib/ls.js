const path = require('path')
const fs = require('fs')
const Promise = require('bluebird')
const baseDir = path.resolve(process.cwd(), process.argv[2] || '.')
const exclude = /(node_modules|^\.[.]*|etc)/
Promise.promisifyAll(fs)

const ls = baseDir => {
  const scanDir = dir => fs.readdirAsync(dir)
    .filter(file => !exclude.test(file))
    .map(file => path.join(dir, file))
    .reduce((files, file) => fs.statAsync(file)
      .then(stat => (stat.isDirectory() ? scanDir(file) : file))
      .then(result => files.concat(result))
      , [])
  return scanDir(baseDir)
    .map(file => path.relative(baseDir, file))
    .then(files => files.sort())
}

ls(baseDir)
  .then(result => {
    console.log(result.join('\n'))
  })
  .catch(err => {
    console.error('Error :', err)
    process.exit(1)
  })
