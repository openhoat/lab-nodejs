const path = require('path')
const fs = require('fs')
const baseDir = path.resolve(process.cwd(), process.argv[2] || '.')
const exclude = /(node_modules|^\.[.]*|etc)/

const ls = (baseDir, cb) => {
  const scanDir = (dir, cb) => {
    fs.readdir(dir, (err, files) => {
      if (err) {
        cb(err)
        return
      }
      files = files
        .filter(file => !exclude.test(file))
        .map(file => path.join(dir, file))
      const result = []
      const next = (i = 0) => {
        const end = i === files.length
        if (end) {
          cb(null, result)
          return
        }
        const file = files[i]
        fs.stat(file, (err, stat) => {
          if (err) {
            cb(err)
            return
          }
          const isDir = stat.isDirectory()
          if (isDir) {
            scanDir(file, (err, files) => {
              if (err) {
                cb(err)
                return
              }
              result.push(...files)
              next(i + 1)
            })
            return
          }
          result.push(file)
          next(i + 1)
        })
      }
      next()
    })
  }

  scanDir(baseDir, (err, files) => {
    if (err) {
      cb(err)
      return
    }
    files = files
      .map(file => path.relative(baseDir, file))
      .sort()
    cb(null, files)
  })
}

ls(baseDir, (err, result) => {
  if (err) {
    console.error('Error :', err)
    process.exit(1)
    return
  }
  console.log(result.join('\n'))
})
