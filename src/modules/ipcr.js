import EE3                         from 'eventemitter3'
import { ipcRenderer }             from 'electron'
import { IPC_CHANNEL, IPC_EVENTS } from '@/constants'
import { create_logger }           from '@/modules/logger'
import { J }                       from '@/modules/journal'
import { settings }                from '@/modules/settings'

const logger = create_logger('bg', {
  bg: '#822',
  text: 'white',
  ipc: false,
  local: false,
})

class IPCR extends EE3 {
  constructor () {
    super()

    this.quiting = false

    ipcRenderer.on(IPC_CHANNEL, (e, type, payload) => {
      this.emit(type, payload)
      logger.log(type, payload)
    })
  }

  send (type, payload) {
    ipcRenderer.send(IPC_CHANNEL, type, payload)
  }

  quit () {
    // little hack to prevent beforeunload listener do save twise
    this.quiting = true

    J.stop()
    settings.save()

    this.send(IPC_EVENTS.QUIT)
  }
}

const ipcr = new IPCR()

export { ipcr }
