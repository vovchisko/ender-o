import { WseClient }     from 'wse'
import { reactive }      from 'vue'
import { create_logger } from '@/modules/logger'
import { settings }      from '@/modules/settings'
import { WS_URL }        from '@/constants'

const STAT_TEXT = Object.freeze({
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
  CONNECTING: 'CONNECTING',
  ERROR: 'ERROR',
  DISCONNECTED: 'DISCONNECTED',
})


const RECONNECT_INTERVAL = 1000 * 40

let _attempts = 0

const logger_in = create_logger('wse.in', { bg: '#ac00ff', text: 'white' })
const logger_out = create_logger('wse.out', { bg: '#4a27d7', text: 'white' })

class Net extends WseClient {
  constructor (url, options, wse_protocol = null) {
    super(url, options, wse_protocol)
    this.stat = reactive({
      is_online: null,
      is_error: false,
      text: STAT_TEXT.OFFLINE,
    })

    this.on('open', (data) => {
      logger_in.log(data)
      this.stat.is_online = true
      this.stat.is_error = false
      this.stat.text = STAT_TEXT.ONLINE
    })

    this.on('message', (c, data) => {
      logger_in.log(c, data)
    })

    this.on('close', (code, reason) => {
      logger_out.log('close', code, reason)

      this.stat.is_online = false
      this.stat.text = this.stat.is_error ? STAT_TEXT.ERROR : STAT_TEXT.DISCONNECTED

      setTimeout(() => {
        _attempts++

        if (_attempts > 2) {
          setTimeout(() => {
            _attempts = 0
            this.connect_when_ready()
          }, RECONNECT_INTERVAL)

          this.stat.text = STAT_TEXT.OFFLINE
          return
        }

        this.stat.text = STAT_TEXT.CONNECTING

        this.connect_when_ready()
      }, 1000)
    })

    this.on('error', (e) => {
      logger_out.log('connection error!', e)
      this.stat.is_error = true
      this.stat.text = STAT_TEXT.ERROR
    })

    // todo: when?
    this.connect_when_ready()
  }

  connect_when_ready () {
    //todo: reconnnect if fid or cmdr name changes
    this.stat.text = STAT_TEXT.CONNECTING

    settings.onready.on(() => {
      this.connect({ cmdr: settings.state.cmdr, fid: settings.state.fid })
    })
  }

  send (c, payload) {
    logger_out.log(c, payload)
    super.send(c, payload)
  }
}

const net = new Net(WS_URL)

setInterval(() => net.send('ping', Math.random()), 5000)

export { net }
