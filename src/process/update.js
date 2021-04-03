import { autoUpdater }                 from 'electron-updater'
import { dialog }                      from 'electron'
import { ipc }                         from '@/process/ipc'
import { IPC_EVENTS, UPDATE_INTERVAL } from '@/constants'

// @link https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/recipes.html#auto-update

export async function updateCheck () {

  autoUpdater.logger = console

  autoUpdater.on('checking-for-update', () => ipc.send(IPC_EVENTS.LOG, 'checking for update...'))
  autoUpdater.on('update-available', () => ipc.send(IPC_EVENTS.LOG, 'update available...'))
  autoUpdater.on('update-not-available', () => ipc.send(IPC_EVENTS.LOG, 'no updates...'))

  autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    ipc.send(IPC_EVENTS.LOG, 'downloaded!')

    const dialogOpts = {
      type: 'info',
      buttons: [ 'Restart', 'Later' ],
      title: 'Application Update',
      message: process.platform === 'win32' ? releaseNotes : releaseName,
      detail: 'A new version has been downloaded. Restart the application to apply the updates.',
    }

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) {
        autoUpdater.quitAndInstall()
      } else {
        clearInterval(timer)
      }
    })
  })

  autoUpdater.on('error', message => {
    ipc.send(IPC_EVENTS.LOG, { err: 'update error', message })
  })

  await autoUpdater.checkForUpdates()

  const timer = setInterval(() => {
    autoUpdater.checkForUpdates()
    ipc.send(IPC_EVENTS.LOG, 'retry checking for update...')
  }, UPDATE_INTERVAL)
}


