import { Menu, shell, Tray }                   from 'electron'
import { join }                                from 'path'
import { IPC_EVENTS, URL_DISCORD, URL_ISSUES } from '@/constants'
import { ipc }                                 from '@/process/ipc'

class TrayIcon {
  constructor () {
    this.tray = null
  }

  create () {
    this.tray = new Tray(join(__static, 'tray-icon.png'))
    this.build_menu()
  }

  build_menu () {
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Discord', type: 'normal', click: () => shell.openExternal(URL_DISCORD) },
      { label: 'Issues on GitHub', type: 'normal', click: () => shell.openExternal(URL_ISSUES) },
      { label: '', type: 'separator' },
      { label: 'Quit', type: 'normal', click: () => ipc.send(IPC_EVENTS.TRAY_QUIT_REQUEST) },
    ])
    this.tray.setToolTip('Ender-O')
    this.tray.setContextMenu(contextMenu)
    this.balloon({
      title: 'Ender-O Overlay is Ready!',
      content: 'Open Elite Dangerus in borderless mode to access it.',
    })
  }

  balloon (opts) {
    this.tray.removeBalloon()

    this.tray.displayBalloon({
      respectQuietTime: false,
      noSound: true,
      ...opts,
    })
    console.log('balloon:', opts)
  }
}

const tray = new TrayIcon()

export { tray }
