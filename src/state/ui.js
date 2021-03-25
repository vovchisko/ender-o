import { computed, reactive } from 'vue'

import { status }      from '@/state/status'
import { J_GUI_FOCUS } from '@/helpers/journal_api'

const SCREENS = Object.freeze({
  DEVELOPMENT: 'DEVELOPMENT',
  EXPLORATION: 'EXPLORATION',
  RACING: 'RACING',
})

const ui = reactive({
  screen: SCREENS.DEVELOPMENT,
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
  hide_screen: computed(() => status.gui_focus > 0 && !ui.blur_screen && !ui.is_interact),
})

export { ui, SCREENS }
