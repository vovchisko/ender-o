import { app, protocol } from 'electron'
import { main }          from '@/process/window'
import { tray }          from '@/process/tray'

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
])

const gotTheLock = app.requestSingleInstanceLock()

app.on('ready', async () => {
  if (!gotTheLock) {
    app.quit()
  } else {
    await main()
  }
})

app.on('second-instance', () => {
  tray.balloon({
    title: 'Ender-O Overlay',
    content: 'Hey, pss! Overlay is already running.',
  })
})

app.on('window-all-closed', () => app.quit())

if (process.platform === 'win32') {
  process.on('message', (data) => { if (data === 'graceful-exit') app.quit() })
} else {
  process.on('SIGTERM', () => app.quit())
}
