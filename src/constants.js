export const APP_NAME = 'ender-o'

export const IPC_CHANNEL = 'main'

export const IPC_EVENTS = Object.freeze({
  SET_CONFIG_CFG: 'SET_CONFIG_CFG', // ui -> bg
  UI_APP_READY: 'UI_APP_READY', // ui -> bg
  SET_OVERLAY: 'SET_OVERLAY', // bg -> ui
  SET_OVERLAY_INTERACT: 'SET_OVERLAY_INTERACT', // bg -> ui
  SETTINGS: 'SETTINGS', // bg -> ui
  REQUEST_KEY_BINDING: 'REQUEST_KEY_BINDING', // bg -> ui
  GLOBAL_KEY_TRIGGER: 'GLOBAL_KEY_TRIGGER', // bg >> ui
  LOG: 'LOG', // bg -> ui
  QUIT: 'QUIT', // ui -> bg
  TRAY_QUIT_REQUEST: 'TRAY_QUIT_REQUEST' // bg -> ui
})

export const ED_WIN_TITLE = 'Elite - Dangerous (CLIENT)'
export const URL_ISSUES = 'https://github.com/vovchisko/ender-o/issues'
export const URL_DISCORD = 'https://discord.gg/8cdbCQQQ'
export const UPDATE_INTERVAL = 30 * 60 * 1000
