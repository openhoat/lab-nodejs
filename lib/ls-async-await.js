const path = require('path')
const fs = require('fs')
const Promise = require('bluebird')
const baseDir = path.resolve(process.cwd(), process.argv[2] || '.')
const exclude = /(node_modules|^\.[.]*|etc)/
Promise.promisifyAll(fs)

async function ls(baseDir) {
  async function scanDir(dir) {
    const files = (await fs.readdirAsync(dir))
      .filter(file => !exclude.test(file))
      .map(file => path.join(dir, file))
    const result = []
    for (const file of files) {
      const stat = await fs.statAsync(file)
      if (stat.isDirectory()) {
        result.push(...await scanDir(file))
      } else {
        result.push(file)
      }
    }
    return result
  }

  return (await scanDir(baseDir))
    .map(file => path.relative(baseDir, file))
    .sort()
}

const main = async () => {
  try {
    const result = await ls(baseDir)
    console.log(result.join('\n'))
  } catch (err) {
    console.error('Error :', err)
    process.exit(1)
  }
}

main()