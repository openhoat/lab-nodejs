const express = require('express')
const redis = require('redis')
const app = express()
const client = redis.createClient()

app.get('/', (req, res) => {
  res.json({hello: 'world'})
})

app.route('/count')
  .get((req, res) => {
    client.get('counter', (err, counter) => {
      if (err) {
        return res.end(500, err)
      }
      res.json({counter: counter && parseInt(counter) || 0})
    })
  })
  .post((req, res) => {
    client.incr('counter', (err, counter) => {
      if (err) {
        return res.end(500, err)
      }
      res.json({counter})
    })
  })
  .delete((req, res) => {
    client.del('counter', err => {
      if (err) {
        return res.end(500, err)
      }
      res.status(204).end()
    })
  })

app.listen(3000, () => {
  console.log('server listening')
})
