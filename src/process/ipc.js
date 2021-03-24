import { IPC_CHANNEL } from '@/constants'
import EE3             from 'eventemitter3'

class IPC extends EE3 {
  constructor () {
    super()
    this.win = null
  }

  attach (win) {
    this.win = win
    this.win.webContents.on('ipc-message', (ev, ch, type, payload) => {
      if (typeof payload === 'object' && payload.module) {
        console.log(`ui:${ payload.module }:${ payload.level || 'log' } >`, ...payload.arguments)
      } else {
        console.log('ui:main >', type, payload)
      }
      this.emit(type, payload)
    })
  }

  send (event, payload) {
    this.win.webContents.send(IPC_CHANNEL, event, payload)
  }
}

const ipc = new IPC()

export { ipc }
