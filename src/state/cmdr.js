import { reactive }      from 'vue'
import { J }             from '@/modules/journal'
import { create_logger } from '@/modules/logger'

const logger = create_logger('cmdr', { bg: 'grey', text: 'white', ipc: true })

export const cmdr = reactive({
  mode: '',
  name: '',
  fid: '',
  squadron: '',
})

export function cmdr_init () {
  J.on('LoadGame', (raw) => {
    cmdr.mode = raw.GameMode
    cmdr.name = raw.Commander
    cmdr.fid = raw.FID

    logger.log('load game:', [ cmdr.fid, 'CMDR', cmdr.name, cmdr.mode ].join(' / '))
  })

  J.on('SquadronStartup', (raw) => {
    cmdr.squadron = raw.SquadronName || ''

    logger.log('load game:', [ cmdr.fid, 'CMDR', cmdr.name, cmdr.mode ].join(' / '))
  })
}
