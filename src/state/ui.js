import { reactive, watch } from 'vue'

const SCREENS = Object.freeze({
  DEVELOPMENT: 'DEVELOPMENT',
  EXPLORATION: 'EXPLORATION',
  RACING: 'RACING',
})

const ui = reactive({
  screen: SCREENS.DEVELOPMENT,
  is_interact: false,
  is_overlay: false,
})


watch(ui.screen, (val) => {
  console.log(val)
})


export { ui, SCREENS }
