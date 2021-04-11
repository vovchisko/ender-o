import { WseClient }     from 'wse'
import { reactive }      from 'vue'
import { create_logger } from '@/modules/logger'
import { settings }      from '@/modules/settings'

const logger_in = create_logger('wse.in', { bg: '#ac00ff', text: 'white' })
const logger_out = create_logger('wse.out', { bg: '#4a27d7', text: 'white' })


class Net extends WseClient {
  constructor (url, options, wse_protocol = null) {
    super(url, options, wse_protocol)
    this.state = reactive({
      is_online: null,
      is_error: false,
    })

    this.on('open', (data) => {
      logger_in.log(data)
      this.state.is_online = true
    })
    this.on('message', (c, data) => {
      logger_in.log(c, data)
    })

    this.on('close', (code, reason) => {
      logger_out.log('close', code, reason)
      this.state.is_online = false

      setTimeout(() => {
        this.connect_when_ready()
      }, 1000)
    })

    this.on('error', (e) => {
      logger_out.log('connection error!', e)
      this.state.is_error = true
    })

    // todo: when?
    // this.connect_when_ready()
  }

  connect_when_ready () {
    //todo: reconnnect if fid or cmdr name changes
    settings.onready.on(() => {
      this.connect({ cmdr: settings.state.cmdr, fid: settings.state.fid })
    })
  }

  send (c, payload) {
    logger_out.log(c, payload)
    super.send(c, payload)
  }
}

const net = new Net('ws://localhost:4200/ender-ws')

export { net }
