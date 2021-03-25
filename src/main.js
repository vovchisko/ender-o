import { createApp } from 'vue'

import app             from '@/app.vue'
import { IPC_EVENTS }  from '@/constants'
import { settings }    from '@/modules/settings'
import { J }           from '@/modules/journal'
import { ipcr }        from '@/modules/ipcr'
import { status_init } from '@/state/status'
import { ui } from '@/state/ui'

require('@/styles/reset.scss')
require('@/assets/fonts/eurocaps.css')
require('@/assets/fonts/titillium-web.css')
require('@/styles/root.scss')
require('@/styles/main.scss')

const stop_and_save = () => {
  window.removeEventListener('beforeunload', stop_and_save)
  J.stop()
  settings.save()
}

function main () {

  settings.read()

  settings.onready.on(async (state) => {
    ipcr.send(IPC_EVENTS.UI_APP_READY)
    ipcr.send(IPC_EVENTS.SETTINGS, state)
    ipcr.send(IPC_EVENTS.REQUEST_KEY_BINDING, { key_ov_focus: settings.state.key_ov_focus })
    await J.go()
  })

  status_init()

  createApp(app).mount('#app')

  window.addEventListener('beforeunload', stop_and_save)

  document.body.setAttribute('overlay', 'off')
  document.body.setAttribute('interact', 'on')
  document.body.setAttribute('fx-lv', 'full') // todo

  ipcr.on(IPC_EVENTS.SET_OVERLAY, (is_overlay) => {
    document.body.setAttribute('overlay', is_overlay ? 'on' : 'off')
    ui.is_overlay = is_overlay
  })

  ipcr.on(IPC_EVENTS.SET_OVERLAY_INTERACT, (is_interact) => {
    document.body.setAttribute('interact', is_interact ? 'on' : 'off')
    ui.is_interact = is_interact
  })

  ipcr.on(IPC_EVENTS.TRAY_QUIT_REQUEST, () => {
    console.log('hi')
    stop_and_save()
    ipcr.quit()
  })
}

main()
