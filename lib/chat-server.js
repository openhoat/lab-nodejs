const net = require('net')
const tc = require('./terminal-colors')

const chatServer = {
  sockets: {},
  registerSocket(socket) {
    socket.setEncoding('utf8')
    socket.id = ++this.noClients
    socket.name = `guest${socket.id}`
    this.sockets[socket.id] = socket
    socket.on('end', () => {
      console.log(`${socket.name} is gone`)
      delete this.sockets[socket.id]
      this.noClients--
      this.broadcastState()
    })
    socket.on('data', data => {
      this.receive(socket, data)
    })
    this.send({to: socket, msg: tc(tc.lightYellow, `Hi ${socket.name}!`)})
    this.sendToOthers({from: socket, msg: tc(tc.lightYellow, `${socket.name} is connected`)})
    this.broadcastState()
  },
  send({to, msg}) {
    console.log('msg :', msg)
    msg = msg.split('\n').filter(item => item !== '').join('\n')
    console.log(`sending to ${to.name} : "${msg}"`)
    to.write(`${msg}\n`)
  },
  sendToOthers({from, msg}) {
    Object.values(this.sockets)
      .filter(socket => socket.id !== from.id)
      .forEach(socket => this.send({to: socket, msg}))
  },
  broadcast(msg) {
    Object.values(this.sockets)
      .forEach(socket => this.send({to: socket, msg}))
  },
  broadcastState() {
    this.server.getConnections((err, count) => {
      console.log(`active clients: ${count}`)
      this.broadcast(tc(tc.lightYellow, `active clients: ${count}`))
    })
  },
  receive(socket, data) {
    data = data.split('\n')[0]
    const cmd = this.parseCmd(data)
    if (cmd) {
      return this.executeCmd({from: socket, cmd: cmd.cmd, args: cmd.args})
    }
    this.sendToOthers({from: socket, msg: tc(tc.lightCyan, `from ${socket.name} : ${data}`)})
  },
  parseCmd(data) {
    const match = data.match(/^\/([\S]+)[\s]+(.*)/)
    if (!match) {
      return null
    }
    const cmd = match[1]
    const args = match[2] && match[2].split(/\s/)
    return {cmd, args}
  },
  commands: {
    // https://fr.wikipedia.org/wiki/Aide:IRC/commandes
    help: {
      description: 'show help',
      action({from}) {
        const commands = Object.keys(this.commands)
          .map(name => `  ${name}: ${this.commands[name].description}`)
          .join('\n')
        const msg = `Supported commands :
${commands}`
        this.send({to: from, msg: tc(tc.lightGray, msg)})
      }
    },
    nick: {
      description: 'change nickname',
      action({from, args}) {
        const newName = args[0]
        this.send({to: from, msg: tc(tc.lightYellow, `now connected as "${newName}"`)})
        this.sendToOthers({from, msg: tc(tc.lightYellow, `"${from.name}" is now connected as "${newName}"`)})
        from.name = newName
      }
    },
  },
  executeCmd({from, cmd, args}) {
    if (!this.commands[cmd]) {
      this.send({to: from, msg: tc(tc.lightRed, `unsupported command "${cmd.cmd}"`)})
      return
    }
    this.commands[cmd].action.call(this, {from, cmd, args})
  },
  start(opt, cb) {
    if (typeof cb === 'undefined' && typeof opt === 'function') {
      cb = opt
      opt = {}
    }
    opt = opt || {}
    Object.assign(this, opt)
    this.noClients = 0
    this.server = net.createServer(socket => {
      this.registerSocket(socket)
    })
    this.server.on('error', err => {
      throw err
    })
    this.server.listen(this.port, () => {
      this.port = this.server.address().port
      console.log(`server bound, listening port ${this.port}`)
      cb && cb()
    })
  },
  stop(cb) {
    this.server.close(() => {
      this.server = null
      cb && cb()
    })
  }
}

module.exports = chatServer

if (!module.parent) {
  chatServer.start({port: 8000})
}
