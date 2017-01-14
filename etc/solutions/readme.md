## TP

### Prérequis :

- Installer nodejs
- Disposer des commandes node et npm
- Un simple éditeur
- Un IDE pour + de confort (Atom, Webstorm, Eclipse, ...)
    
### Créer un projet :

```
$ mkdir tmp/hello
$ cd tmp/hello
$ npm init
```

### Exécuter :

index.js :

```
console.log('hello')
```

```
$ node index.js
```

### Utiliser npm :

```
$ npm start
```

### Asynchronismes :

#### setTimeout

```
setTimeout(() => {
  console.log('tic')
}, 1000)
console.log('hello')
```

Remarque : "hello" s'affiche dés le début

#### setInterval

```
setInterval(() => {
  console.log('tic')
}, 1000)
console.log('hello')
```

Remarque : Le programme ne se termine jamais, pourquoi ?

#### timer

```
const timer = setInterval(() => {
  console.log('tic')
}, 1000)

setTimeout(() => {
  clearInterval(timer)
}, 3500)

console.log('hello')
```

### Utiliser des modules :

#### fs

##### sync :

```
const fs = require('fs')

const files = fs.readdirSync(__dirname)

console.log('files :', files)
```

##### async :

```
const fs = require('fs')

const files = fs.readdir(__dirname)

console.log('files :', files)
```

```
$ node index.js
files : undefined
(node:10029) DeprecationWarning: Calling an asynchronous function without callback is deprecated.
```

```
const fs = require('fs')

fs.readdir(__dirname + 'zz', (err, files) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log('files :', files)
})
```

#### Afficher le type de fichier

```
const path = require('path')
const fs = require('fs')

fs.readdir(__dirname, (err, files) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  files.forEach(file => {
    fs.stat(path.join(__dirname, file), (err, stat) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      console.log(`${file} est un répertoire :`, stat.isDirectory())
    })
  })
})
```

Remarque : début du callback hell !

#### Promesse

```
$ yarn add bluebird
```

```
const path = require('path')
const fs = require('fs')
const Promise = require('bluebird')

Promise.promisifyAll(fs)

fs.readdirAsync(__dirname)
  .each(file => fs.statAsync(path.join(__dirname, file)
    .then(stat => {
      console.log(`${file} est un répertoire :`, stat.isDirectory())
    })
  )
```

### Un serveur chat en 20 lignes

```
const net = require('net')
const sockets = []

net.createServer(socket => {
  sockets.push(socket)
  socket.on('data', data => {
    sockets.forEach(other => {
      if (other !== socket) {
        other.write(data)
      }
    })
  })
  socket.on('end', () => {
    const index = sockets.indexOf(socket)
    sockets.splice(index, 1)
  })
}).listen(3456, () => {
  console.log('ready to chat!')
})
```

### Serveur web polyvalent

#### hello http

#### hello express

#### express compteur redis en 40 lignes
