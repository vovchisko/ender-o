import { ipcr }       from '@/modules/ipcr'
import { IPC_EVENTS } from '@/constants'

export function create_logger (pre, { bg = 'black', text = 'white', ipc = false, log = true }) {
  const decor = [ `%c ${ pre } `, `background: ${ bg }; color:${ text }` ]
  return {
    log: function () {
      if (ipc) ipcr.send(IPC_EVENTS.LOG, {
        module: pre,
        level: 'log',
        arguments: [ ...arguments ],
      })
      if (log) console.log(...decor, ...arguments)
    },
    warn: function () {
      if (ipc) ipcr.send(IPC_EVENTS.LOG, {
        module: pre,
        level: 'warn',
        arguments: [ ...arguments ],
      })
      if (log) console.warn(...decor, ...arguments)
    },
    error: function () {
      if (ipc) ipcr.send(IPC_EVENTS.LOG, {
        module: pre,
        level: 'error',
        arguments: [ ...arguments ],
      })
      if (log) console.error(...decor, ...arguments)
    },
  }
}

