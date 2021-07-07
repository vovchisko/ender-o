const UDP_PORT = 42000
const UDP_HOST = '127.0.0.1'

const dgram = require('dgram')
const sock = dgram.createSocket('udp4')

let last_rinfo = {}

function subscribe_request (rinfo) {
  try {
    sock.send(JSON.stringify({
      Subscribe: true,
      All: true,
    }), rinfo.port, rinfo.address, (err) => err ? console.log(err) : 'sent')

  } catch (e) {
    console.error('failed to subscribe', rinfo)
  }
}


sock.on('error', (err) => {
  console.log(`sock error:\n${ err.stack }`)
  sock.close()
})


sock.on('message', (data, rinfo) => {
  Object.apply(last_rinfo, rinfo)
  console.log('pushed')
  jstream.push(data)
})

sock.on('listening', () => {
  const address = sock.address()
  console.log(`sock listening ${ address.address }:${ address.port }`)
})

sock.bind(UDP_PORT, UDP_HOST)

