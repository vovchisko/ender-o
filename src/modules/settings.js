import fs     from 'fs'
import path   from 'path'
import Signal from 'a-signal'

class Settings {
  constructor () {
    this.is_ready = false

    // ! do not rewrite this object entirely. links can be saved via events
    this.state = {
      journal_path: '',
      cmdr: '',
      language: '',
      game_version: '',
      last_journal: -1,
      last_record: -1,
      show_key_tips: 'yes',
      key_ov_focus: 'F3',
    }

    this.onready = new Signal({ late: true, memorable: true })
    this.onerror = new Signal()

    this.file = this._get_path()

  }

  _get_path () {
    let CFG_DIR = './'
    if (!fs.existsSync(CFG_DIR)) fs.mkdirSync(CFG_DIR, { recursive: true })
    return path.resolve(`${ CFG_DIR }/settings.cfg`)
  }

  read () {
    try {
      if (fs.existsSync(this.file)) {
        let lines = fs.readFileSync(this.file)
            .toString()
            .split('\n')
            .map(l => l.trim())
            .filter(l => Boolean(l))

        for (let i = 0; i < lines.length; i++) {
          let [ key, val ] = lines[i].split('=').map(p => p.trim())
          this.state[key] = val
        }
      } else {
        this.save()
      }
      if (!this.is_ready) {
        this.onready.emit(this.state)
        this.is_ready = true
      }
    } catch (err) {
      console.error(err)
      this.onerror.emit({ err, file: this.file, state: this.state })
    }
  }

  save () {
    let lines = []
    for (let p in this.state) {
      if (p[0] !== '_' && typeof this.state[p] !== 'function') {
        lines.push(p + ' = ' + this.state[p])
      }
    }

    fs.writeFileSync(this.file, lines.join('\n'))
  }
}

const settings = new Settings()
export { settings }
