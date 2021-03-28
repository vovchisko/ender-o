import { reactive }      from 'vue'
import { J }             from '@/modules/journal'
import { create_logger } from '@/modules/logger'
import {
  extract,
  J_BODY_TYPE,
  J_FLAGS_MAP,
  J_GUI_FOCUS,
  J_JUMP_TYPE,
  J_LEGAL_STATE,
}                        from '@/helpers/journal_api'

const logger = create_logger('status', { bg: 'grey', text: 'white', log: true })

let _last_raw = {}

export const TRANSPORT_TYPE = {
  UNKNOWN: '',
  LEGS: 'LEGS',
  SRV: 'SRV',
  FIGHTER: 'FIGHTER',
  SHIP: 'SHIP',
}


export const status = reactive({
  updated: '',
  legal_state: J_LEGAL_STATE.CLEAN,
  fire_group: 0,
  gui_focus: J_GUI_FOCUS.NO_FOCUS,
  fuel: 0,
  fuel_reservouir: 0,
  cargo: 0,
  pips: [ 0, 0, 0 ],
  transport: TRANSPORT_TYPE.UNKNOWN,
  near: {
    body_id: 0,
    body: '',
    type: J_BODY_TYPE.NULL,
  },
  docked: {
    name: '',
    type: '',
    market_id: null,
  },
  pos: {
    system_addr: null,
    system: '',
    planet: '',
    planet_r: 0,
    lat: null,
    lon: null,
    alt: null,
    heading: 0,
  },
  flags: Object.fromEntries(J_FLAGS_MAP.map(a => [ a, 0 ])),
})

export function status_init () {
  J.on('Status', (raw) => {
    if (!raw) return
    status.updated = raw.timestamp

    status.legal_state = raw.LegalState || J_LEGAL_STATE.CLEAN
    status.fire_group = raw.FireGroup || 0
    status.gui_focus = raw.GuiFocus || 0
    status.fuel = raw.Fuel ? raw.Fuel.FuelMain || 0 : 0
    status.fuel_reservouir = raw.Fuel ? raw.Fuel.FuelReservoir || 0 : 0
    status.cargo = raw.Cargo || 0
    status.pips = raw.Pips || [ 0, 0, 0 ]

    status.pos.lat = raw.Latitude !== undefined ? raw.Latitude : null
    status.pos.lon = raw.Longitude  !== undefined ? raw.Longitude : null
    status.pos.alt = raw.Altitude  !== undefined ? raw.Altitude : null
    status.pos.heading = raw.Heading || 0
    status.pos.planet = extract.stellar_name(raw.BodyName)
    status.pos.planet_r = raw.PlanetRadius || 0 // ?

    if (raw.Flags !== _last_raw.Flags) {
      extract.flags(raw.Flags, status.flags)

      if (status.flags.InMainShip) status.transport = TRANSPORT_TYPE.SHIP
      if (status.flags.InFighter) status.transport = TRANSPORT_TYPE.FIGHTER
      if (status.flags.InSRV) status.transport = TRANSPORT_TYPE.SRV
    }

    if (_last_raw.BodyName && !raw.BodyName) {
      status.near.body_id = 0
      status.near.body = ''
      status.near.type = ''
    }

    _last_raw = raw
  })

  J.on('Docked', (ev) => {
    status.docked.name = ev.StationName || ''
    status.docked.name = ev.StationName || ''
    status.docked.type = ev.StationType || ''
    status.docked.market_id = ev.MarketID || 0
  })

  J.on('Undocked', (ev) => {
    status.docked.name = ''
    status.docked.type = ''
    status.docked.market_id = 0
  })

  J.on('LeaveBody', (ev) => {
    status.near.body_id = 0
    status.near.body = ''
    status.near.type = ''
  })

  J.on('ApproachBody', (ev) => {
    status.near.body_id = ev.BodyID
    status.near.body = extract.stellar_name(ev.Body)
    // because this event only fires on landable planets
    status.near.type = J_BODY_TYPE.PLANET

    status.pos.system_addr = ev.SystemAddress
    status.pos.system = extract.stellar_name(ev.StarSystem)
  })

  J.on('Location', (ev) => {
    status.near.body = extract.stellar_name(ev.Body)
    status.near.body_id = ev.BodyID
    status.near.type = extract.body_type(ev.BodyType)

    if (ev.Docked) {
      status.docked.name = ev.StationName || ''
      status.docked.type = ev.StationType || ''
      status.docked.market_id = ev.MarketID || 0
    }

    status.pos.system_addr = ev.SystemAddress
    status.pos.system = extract.stellar_name(ev.StarSystem)
    status.pos.star_pos = ev.StarPos
  })

  J.on('FSDJump', (ev) => {
    status.pos.system = extract.stellar_name(ev.StarSystem)
    status.pos.star_pos = ev.StarPos
    status.pos.system_addr = ev.SystemAddress
  })

  J.on('StartJump', (ev) => {
    if (ev.JumpType === J_JUMP_TYPE.HYPERSPACE) {
      status.near.body = ''
      status.near.body_id = 0
      status.near.type = ''
    }
  })

  J.on('SupercruiseExit', (ev) => {
    status.pos.system = extract.stellar_name(ev.StarSystem)
    status.pos.system_addr = ev.SystemAddress
    status.pos.star_pos = ev.StarPos

    status.near.body = extract.stellar_name(ev.Body)
    status.near.body_id = ev.BodyID
    status.near.type = extract.body_type(ev.BodyType)

    logger.log(extract.body_type(ev.BodyType), ev.BodyID)
  })

  J.on('SupercruiseEntry', (ev) => {
    status.pos.system = extract.stellar_name(ev.StarSystem)
    status.pos.system_addr = ev.SystemAddress

    if (!status.pos.planet) {
      status.near.body = ''
      status.near.body_id = 0
      status.near.type = ''
    }
  })
}

