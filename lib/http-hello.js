const http = require('http')

const server = http.createServer((req, res) => {
  if (req.url == '/health') {
    res.writeHead(200)
    res.end()
    return
  }
  res.writeHead(200, {
    'Content-Type': 'application/json'
  })
  res.end(JSON.stringify({hello: 'world'}))
})

server.listen(process.env.NODE_PORT || 3000, process.env.NODE_IP || 'localhost', () => {
  console.log('server is listening')
})
