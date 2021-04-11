import path     from 'path'
import fs       from 'fs'
import os       from 'os'
import { exec } from 'child_process'
import EE3      from 'eventemitter3'

import { create_logger } from '@/modules/logger'
import { settings }      from '@/modules/settings'

const logger = create_logger('journal', { bg: 'green', text: 'white' }, true)

const JOURNAL_HEART_RATE = 1000
const REG_KEY = '{4C5C32FF-BB9D-43B0-B5B4-2D72E54EAAA4}'
const REG_QUERY = `reg query "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders" /v ` + REG_KEY
const DEFAULT_DIR = path.join(os.homedir(), 'Saved Games\\Frontier Developments\\Elite Dangerous')
const ENDER_CMD_PREFIX = '/ender'
const IGNORED_JOURNAL_RECORDS = [
  'Music',
  'ReceiveText',
  'SendText',
  'Market',
  'FSSSignalDiscovered',
  'ApproachSettlement',
  'Friends',
  'NpcCrewPaidWage',
  'RepairAll',
  'RefuelAll',
  'BuyAmmo',
]

const DATA_FILES = [
  'Status.json',
  'Cargo.json',
  'NavRoute.json',
  'Outfitting.json',
  'ModulesInfo.json',
  'Market.json',
  'Shipyard.json',
]

const ISSH = {
  NO_JOURNALS: 'ender-no-journals',
  ERROR: 'ender-error',
}

const stateHookEvents = [ 'NewCommander', 'Commander', 'LoadGame', 'Fileheader' ]

class Journal extends EE3 {

  constructor () {
    super()

    this._working = false
    this.watcher = null
    this.files = []
    this.include_old_journals = false
    this._data_cache = {}
  }

  check_journal_path (path) {
    if (path) {
      try {
        let files = fs.readdirSync(path)
        return files.includes(DATA_FILES[0])
      } catch (e) {
        return false
      }
    }
    return false
  }

  ensure_journal_path (c_path = '') {
    return new Promise(async (resolve, reject) => {
      if (this.check_journal_path(c_path)) {
        logger.log('resolved current path')
        return resolve(c_path)
      }

      if (this.check_journal_path(DEFAULT_DIR)) {
        logger.log('resolved default path')
        return resolve(DEFAULT_DIR)
      }

      exec(REG_QUERY, (err, stdout) => {
        if (err) {
          logger.error('error executing reg query!')
          return reject('')
        }

        stdout.split('\n').forEach((val) => {
          if (val.includes(REG_KEY)) {
            let registry_path = path.join(val.split('REG_EXPAND_SZ')[1].trim(), 'Frontier Developments\\Elite Dangerous')
            if (this.check_journal_path(registry_path)) {
              logger.log('resolved path by registry')
              return resolve(registry_path)
            } else {
              return reject('')
            }
          }
        })
      })
    })
  }

  async go () {
    logger.log('journal started')

    // double-check journal path
    logger.log('checking journal path...')
    const jpath_resolved = await this.ensure_journal_path(settings.state.journal_path)

    if (!jpath_resolved) {
      logger.error('unable to locate journals')
      return
    }

    settings.state.journal_path = jpath_resolved

    logger.log('resolved jouornal path:', settings.state.journal_path)

    await this.scan_all()

    if (!this.include_old_journals) {
      logger.log('jumping to last journal...')
      this.move_caret()
    }

    if (this.timer) clearInterval(this.timer)

    this.timer = setInterval(() => {
      this.force_important_files()
      this.do_some_work()
    }, JOURNAL_HEART_RATE)

    try {
      this.watcher = fs.watch(settings.state.journal_path, (ev, f) => {
        ev === 'change' ? this.file_check(f) : this.scan_all()
      })
    } catch (err) {
      return this.stop(ISSH.ERROR, err)
    }
  }

  scan_all () {
    let files = fs.readdirSync(settings.state.journal_path)
    if (!files) return this.stop(ISSH.NO_JOURNALS)
    for (let f in this.files) if (!files.includes(f)) delete this.files[f]
    for (let i = 0; i < files.length; i++) this.file_check(files[i])
  }

  stop (code, err) {
    if (err) logger.error(err)
    try {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      if (this.watcher) {
        this.watcher.close()
        this.watcher = null
      }
    } catch (e) {
      logger.error('FATAL! Journal unable to stop!')
      process.exit(-1)
    }
    logger.log('stopped', code)
  }

  move_caret () {
    const jfiles = Object.keys(this.files)
        .filter((fname) => this.is_log_file(fname))
        .sort()
        .reverse()

    const caret_num = _jnum(jfiles.find(fn => fn.includes('.01.')))

    settings.state.last_journal = caret_num
    settings.state.last_record = -1

    logger.log('journal caret:', caret_num, 'rec: ', -1)

    jfiles.forEach(fname => {
      if (caret_num > _jnum(fname)) {
        this.files[fname].changed = caret_num <= _jnum(fname)
      }
    })

  }

  get_last_journal () {
    let f = null
    for (let i in this.files)
      if (this.files[i].jnum && (!f || this.files[i].jnum > f.jnum)) f = this.files[i]
    return f
  }

  force_important_files () {
    let last = this.get_last_journal()
    this.file_check('Status.json')
    if (last) this.file_check(last.f)
  }

  async do_some_work () {
    if (this._working) return

    this._working = true

    for (let fname in this.files) {
      if (!this.files[fname].changed) continue
      if (DATA_FILES.includes(fname)) {
        try {
          await this.read_data(fname)
          this.files[fname].changed = false
        } catch (e) {
          logger.warn('journal work Error [data]:', fname)
          if (e.code && e.code === 'ENOENT') this.stop(ISSH.ERROR, e)
          this.files[fname].changed = true
        }
      } else {
        try {
          await this.read_log(fname)
          this.files[fname].changed = false
        } catch (e) {
          logger.warn('journal work Error [log]:', fname)
          if (e.code && e.code === 'ENOENT') this.stop(ISSH.ERROR, e)
          this.files[fname].changed = true
        }
      }
    }

    this._working = false
  }


  async read_log (f) {

    let jnum = _jnum(f)

    if (settings.state.last_journal > _jnum(f)) return

    const data = fs.readFileSync(settings.state.journal_path + '/' + f, 'utf8')

    let lines = data.toString().split('\n')
    let events_count = 0

    let _last_jour = settings.state.last_journal
    let _last_rec = settings.state.last_record
    if (jnum > _last_jour) {
      _last_jour = jnum
      _last_rec = -1
    }

    for (let i = 0; i < lines.length; i++) {
      if (!lines[i]) continue
      if (!this.is_new_rec(jnum, i)) continue

      let rec = parse_record(lines[i])

      if (!rec) return logger.warn('Warnign! unable to parse record!', _last_jour)

      _last_rec = i
      _last_jour = jnum

      if (_is_ignored_record(rec)) continue
      if (stateHookEvents.includes(rec.event)) this.state_update_rec(rec)

      try {
        this.emit(rec.event, rec)
        this.emit('record', rec.event, rec)
      } catch (err) {
        console.error(err)
      }
      events_count++
    }

    if (!events_count) return

    settings.state.last_record = _last_rec
    settings.state.last_journal = _last_jour
  }

  is_target_file (fname) {
    return (DATA_FILES.includes(fname) || this.is_log_file(fname))
  }

  is_log_file (fname) {
    return fname.startsWith('Journal.') && fname.endsWith('.log')
  }

  file_check (f) {
    if (!this.is_target_file(f)) return

    try {
      const stat = fs.statSync(path.join(settings.state.journal_path, f))

      if (this.files[f]) {
        if (this.files[f].mtime !== stat.mtimeMs || this.files[f].size !== stat.size) {
          this.files[f].mtime = stat.mtimeMs
          this.files[f].size = stat.size
          this.files[f].changed = true
        }
      } else {
        let jnum = _jnum(f)
        this.files[f] = {
          f: f,
          jnum: jnum,
          mtime: stat.mtimeMs,
          size: stat.size,
          changed: true,
        }
      }

      return this.files[f]
    } catch (err) {
      return this.stop(ISSH.ERROR, err)
    }
  }

  read_data (f) {
    const line = fs.readFileSync(settings.state.journal_path + '/' + f)
    let rec = parse_record(line)

    this._data_cache[f] = rec

    if (!rec) return


    try {
      this.emit(rec.event, rec)
      this.emit('data', rec.event, rec)
    } catch (err) {
      console.error(err)
    }
  }

  state_update_rec (rec) {
    if (rec.event === 'NewCommander') {
      if (rec.Name) settings.state.cmdr = rec.Name
    }

    if (rec.event === 'Commander') {
      if (rec.Name) settings.state.cmdr = rec.Name
      if (rec.FID) settings.state.fid = rec.FID
    }

    if (rec.event === 'LoadGame') {
      if (rec.Commander) settings.state.cmdr = rec.Commander
      if (rec.FID) settings.state.fid = rec.FID

    }
    if (rec.event === 'Fileheader') {
      settings.state.language = rec.language
      settings.state.game_version = rec.gameversion
    }
  }

  is_new_rec (jnum, i) {
    let _last_jour = settings.state.last_journal
    let _last_rec = settings.state.last_record
    if (jnum > _last_jour) _last_rec = -1
    return _last_rec < i
  }
}

// HELPERS

function _is_ignored_record (rec) {
  if (rec.event === 'SendText' && !rec.Message.startsWith(ENDER_CMD_PREFIX)) return true
  return IGNORED_JOURNAL_RECORDS.includes(rec.event)
}

function _jnum (f) {
  let parts = path.basename(f).split('.')
  if (parts.length < 4) return null
  return (parts[1] + '.' + parts[2]) * 1
}

function parse_record (string) {
  try {
    return JSON.parse(string)
  } catch (e) {
    return null
  }
}

const J = new Journal()


export { J, ISSH }

