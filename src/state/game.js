import { reactive }      from 'vue'
import { J }             from '@/modules/journal'
import { create_logger } from '@/modules/logger'

const logger = create_logger('status', { bg: 'grey', text: 'white' , ipc: true})

let _last_raw = {}

export const game = reactive({
  updated: '',
  journal_part: '',
  language: '',
  gameversion: '',
  build: '',
})

export function game_init () {
  J.on('Fileheader', (raw) => {
    if (!raw) return
    game.updated = raw.timestamp
    game.journal_part = raw.part
    game.language = raw.language
    game.gameversion = raw.gameversion
    game.build = raw.build

    logger.log('game:', raw.gameversion, raw.build)

    _last_raw = raw
  })
}

