import { app, BrowserWindow, dialog, globalShortcut, shell } from 'electron'
import { overlayWindow as OW }                               from 'electron-overlay-window'
import { createProtocol }                                    from 'vue-cli-plugin-electron-builder/lib'
import { ED_WIN_TITLE, IPC_EVENTS, URL_DISCORD, URL_ISSUES } from '@/constants'

import { tray }        from '@/process/tray'
import { ipc }         from '@/process/ipc'
import { updateCheck } from '@/process/update'

const IS_DEV = process.env.NODE_ENV !== 'production'

let UI = null
let IS_OVERLAY = false
let IS_INTERACT = true

const catch_err = (e) => console.error(e)

export async function createUIWindow () {
  const win = new BrowserWindow({
    icon: '@/assets/logo.png',
    ...OW.WINDOW_OPTS,
    width: 800,
    height: 600,
    resizable: false,
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      spellcheck: false,
    },
  })

  ipc.attach(win)

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL).catch(catch_err)
    // if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    win.loadURL('app://./index.html').catch(catch_err)
  }

  return win
}

function on_quit () {
  console.log('bye!')
  app.quit()
  setTimeout(() => process.exit(0), 200) // backup for dev run
}

function on_settings_updated (settings) {
  // todo: if we event need to do anything...
}

function on_key_binding_request (settings) {
  globalShortcut.unregisterAll()
  globalShortcut.register(settings.key_ov_focus, toggle_focus)
}

function toggle_focus () {
  if (!IS_OVERLAY) return
  IS_INTERACT = !IS_INTERACT
  UI.setFocusable(IS_INTERACT)
  UI.setIgnoreMouseEvents(!IS_INTERACT)
  UI.focus()
  ipc.send(IPC_EVENTS.SET_OVERLAY_INTERACT, IS_INTERACT)
}

function ow_attached (event) {
  if (!event.hasAccess) {
    const dialogOpts = {
      type: 'info',
      buttons: [ 'Close', 'Report Issue on Github', 'Visit Discrod Channel' ],
      title: 'Unable to attach overlay',
      message: 'Can`t take this anymore!',
      detail: 'Ender-O was unable to attach overlay to Elite Dangerous Client. You can help to fix it this by reporting the issue on github or visiting our discord.',
    }

    dialog.showMessageBox(dialogOpts).then(async (result) => {
      if (result.response === 1) {
        shell.beep()
        await shell.openExternal(URL_ISSUES)
      }

      if (result.response === 2) {
        shell.beep()
        await shell.openExternal(URL_DISCORD)
      }
      process.exit(-1)
    })
  }

  toggle_focus()

  ipc.send(IPC_EVENTS.SET_OVERLAY, IS_OVERLAY)
  ipc.send(IPC_EVENTS.SET_OVERLAY_INTERACT, IS_INTERACT)
}

function ui_app_ready () {
  if (!IS_OVERLAY) {
    console.log('attempting to attach: ', `"${ ED_WIN_TITLE }"`)
    OW.attachTo(UI, ED_WIN_TITLE)

    console.log('No errors so far...')
    IS_OVERLAY = true
  }
  ipc.send(IPC_EVENTS.SET_OVERLAY, IS_OVERLAY)
  ipc.send(IPC_EVENTS.SET_OVERLAY_INTERACT, IS_INTERACT)
}

OW.on('attach', ev => {
  console.log('WO: attach', ev)
  ow_attached(ev)
})
OW.on('detach', ev => { console.log('WO: detach', ev) })
// OW.on('blur', ev => { console.log('WO: blur', ev)})
// OW.on('focus', ev => { console.log('WO: focus', ev)})
// OW.on('fullscreen', ev => console.log('WO: fullscreen', ev))
// OW.on('moveresize', ev => console.log('WO: fullscreen', ev))


export async function main () {
  tray.create()

  ipc.on(IPC_EVENTS.UI_APP_READY, ui_app_ready)
  ipc.on(IPC_EVENTS.SETTINGS, on_settings_updated)
  ipc.on(IPC_EVENTS.REQUEST_KEY_BINDING, on_key_binding_request)
  ipc.on(IPC_EVENTS.QUIT, on_quit)

  UI = await createUIWindow()

  if (!IS_DEV) await updateCheck()

  ipc.send(IPC_EVENTS.LOG, 'background idle...')
  ipc.send(IPC_EVENTS.SET_OVERLAY, IS_OVERLAY)
  ipc.send(IPC_EVENTS.SET_OVERLAY_INTERACT, IS_INTERACT)
}
