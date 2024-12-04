const connect = require('connect')
const serveStatic = require('serve-static')
const path = require('path')

const staticDir = path.join(__dirname, '..')

// This port is same with the one in the web/app.ts
const port = 5500

console.log('💬 Serving static files from', staticDir)

connect()
  .use(serveStatic(staticDir))
  .listen(port, () => {
    console.log('✅ Server running on', port, '...')
    console.log(
      'You can open:\n\nhttp://localhost:' +
        port +
        '\n\nin your browser to check frontend.'
    )
    return
  })
