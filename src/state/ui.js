import { computed, reactive, watch } from 'vue'

import { status }      from '@/state/status'
import { J_GUI_FOCUS } from '@/helpers/journal_api'

const SCREENS = Object.freeze({
  DEVTOOLS: 'DEVTOOLS',
  // EXPLORATION: 'EXPLORATION',
  // RACING: 'RACING',
  TRACK_EDITOR: 'TRACK_EDITOR',
})

export const UI_PANELS = {
  CENTRAL_MAIN: 'CENTRAL_MAIN',
  HEADING: 'HEADING',
  LEFT_LONG: 'LEFT_LONG',
  RIGHT_LONG: 'RIGHT_LONG'
}

const ui = reactive({
  screen: SCREENS.TRACK_EDITOR,
  is_interact: false,
  is_overlay: false,
  blur_screen: computed(() => {
    return !ui.is_interact && (
        status.gui_focus === J_GUI_FOCUS.EXT_LEFT ||
        status.gui_focus === J_GUI_FOCUS.COMM ||
        status.gui_focus === J_GUI_FOCUS.ROLE ||
        status.gui_focus === J_GUI_FOCUS.INT_RIGHT
    )
  }),
  hide_screen: computed(() => (
      status.gui_focus > 0 &&
      !ui.blur_screen &&
      !ui.is_interact
  )),
})

let last_ui_blur_screen = null
let last_ui_hide_screen = null

watch(ui, () => {
  if (ui.blur_screen !== last_ui_blur_screen) {
    document.body.setAttribute('fx-blur-screen', ui.blur_screen)
  }
  if (ui.hide_screen !== last_ui_hide_screen) {
    document.body.setAttribute('fx-hide-screen', ui.blur_screen)
  }
})

export { ui, SCREENS }
