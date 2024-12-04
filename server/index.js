const connect = require('connect')
const serveStatic = require('serve-static')
const path = require('path')

const staticDir = path.join(__dirname, '..')

console.log('Serving static files from', staticDir)

connect()
  .use(serveStatic(staticDir))
  .listen(8080, () => {
    console.log('✅ Server running on 8080...')
    return
  })
