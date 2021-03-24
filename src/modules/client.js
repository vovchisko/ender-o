const { WseClient } = require('wse')

const client = new WseClient('ws://localhost:4430', {/* classic ws options */ })

// client object can be re-used btw.
// no need to create new instance if this one disconnected.
// just call connect again.
client.connect({ id: 'USER-1', api_key: 'yes_it_is' })

client.on('open', (dat) => console.log(' >> connected and logged in', dat))
client.on('message', (c, dat) => console.log(' >> message form server', c, dat))
client.on('close', (code, reason) => console.log(' >> connection closed', code, reason))
client.on('error', (e) => console.log(' >> connection error', e))

// not let's talk.
setInterval(() => {
  client.send('ping', Math.random())
}, 1000)

export { client }
