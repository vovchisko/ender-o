import { reactive }      from 'vue'
import { J }             from '@/modules/journal'
import { create_logger } from '@/modules/logger'
import get               from 'lodash/get'

const logger = create_logger('status', { bg: 'grey', text: 'white' })

export const STATUS_FLAGS_MAP = [
  'Docked',
  'Landed',
  'LandingGearRetracted',
  'ShieldsUp',
  'Supercruise',
  'FlightAssistOff',
  'HardpointsDeployed',
  'InWing',
  'LightsOn',
  'CargoScoopDeployed',
  'SilentRunning',
  'ScoopingFuel',
  'SrvHandbrake',
  'SrvTurretView',
  'SrvTurretRetracted',
  'SrvDriveAssist',
  'FsdMassLocked',
  'FsdCharging',
  'FsdCooldown',
  'LowFuel',
  'OverHeating',
  'HasLatLong',
  'IsInDanger',
  'BeingInterdicted',
  'InMainShip',
  'InFighter',
  'InSRV',
  'HudAnalysisMode',
  'NightVision',
  'AltitudeFromAverageRadius',
  'fsdJump',
  'srvHighBeam',
]
export const GUI_FOCUS = {
  NO_FOCUS: 0,    // NoFocus
  RIGHT: 1,       // InternalPanel (right hand side)
  LEFT: 2,        // ExternalPanel (left hand side)
  COMM: 3,        // CommsPanel (top)
  ROLE: 4,        // RolePanel (bottom)
  STATION: 5,     // StationServices
  GALAXY_MAP: 6,  // GalaxyMap
  SYSTEM_MAP: 7,  // SystemMap
  ORREY: 8,       // Orrery
  FSS: 9,         // FSS mode
  SSA: 10,        // SAA mode
  CODEX: 11,      // Codex
}

export const LEGAL_STATE = {
  CLEAN: 'Clean',
  ILLEGAL_CARGO: 'IllegalCargo',
  SPEEDING: 'Speeding',
  WANTED: 'Wanted',
  HOSTILE: 'Hostile',
  PASSENGER_WANTED: 'PassengerWanted',
  WARRANT: 'Warrant',
}

export const status = reactive({
  updated: new Date(0),
  legal_state: LEGAL_STATE.CLEAN,
  fire_group: 0,
  gui_focus: GUI_FOCUS.NO_FOCUS,
  lon: 0,
  lat: 0,
  alt: 0,
  heading: 0,
  fuel: 0,
  fuel_reservouir: 0,
  cargo: 0,
  pips: [ 0, 0, 0 ],
  pos: {
    updated: new Date(),
    system_addr: null,
    system: '',
    body: '',
    body_r: 0,
    body_id: null,
    lat: 0,
    lon: 0,
    alt: 0,
    heading: 0,
  },
  is: {
    Docked: 0,                        // 0     1               Docked, (on a landing pad)
    Landed: 0,                        // 1     2               Landed, (on planet surface)
    LandingGearRetracted: 0,          // 2     4               Landing Gear Down
    ShieldsUp: 0,                     // 3     8               Shields Up
    Supercruise: 0,                   // 4     16              Supercruise
    FlightAssistOff: 0,               // 5     32              FlightAssist Off
    HardpointsDeployed: 0,            // 6     64              Hardpoints Deployed
    InWing: 0,                        // 7     128             In Wing
    LightsOn: 0,                      // 8     256             LightsOn
    CargoScoopDeployed: 0,            // 9     512             Cargo Scoop Deployed
    SilentRunning: 0,                 // 10    1024            Silent Running,
    ScoopingFuel: 0,                  // 11    2048            Scooping Fuel
    SrvHandbrake: 0,                  // 12    4096            Srv Handbrake
    SrvTurretView: 0,                 // 13    8192            Srv using Turret view
    SrvTurretRetracted: 0,            // 14    16384           Srv Turret retracted (close to ship)
    SrvDriveAssist: 0,                // 15    32768           Srv DriveAssist
    FsdMassLocked: 0,                 // 16    65536           Fsd MassLocked
    FsdCharging: 0,                   // 17    131072          Fsd Charging
    FsdCooldown: 0,                   // 18    262144          Fsd Cooldown
    LowFuel: 0,                       // 19    524288          Low Fuel ( < 25% )
    OverHeating: 0,                   // 20    1048576         Over Heating ( > 100% )
    HasLatLong: 0,                    // 21    2097152         Has Lat Long
    IsInDanger: 0,                    // 22    4194304         IsInDanger
    BeingInterdicted: 0,              // 23    8388608         Being Interdicted
    InMainShip: 0,                    // 24    16777216        In MainShip
    InFighter: 0,                     // 25    33554432        In Fighter
    InSRV: 0,                         // 26    67108864        In SRV
    HudAnalysisMode: 0,               // 27    134217728       Hud in Analysis mode
    NightVision: 0,                   // 28    268435456       Night Vision
    AltitudeFromAverageRadius: 0,     // 29    536870912       Altitude from Average radius
    fsdJump: 0,                       // 30    1073741824      fsdJump
    srvHighBeam: 0,                   // 31    2147483648      srvHighBeam
  },
})

export function status_init () {
  J.on('Status', (raw) => {
    if (!raw) return
    status.legal_state = get(raw, 'LegalState', LEGAL_STATE.CLEAN)
    status.fire_group = get(raw, 'FireGroup', 0)
    status.gui_focus = get(raw, 'GuiFocus', 0)
    status.fuel = get(raw, 'Fuel.FuelMain', 0)
    status.fuel_reservouir = get(raw, 'Fuel.FuelReservoir', 0)
    status.cargo = get(raw, 'Cargo', 0)
    status.pips = get(raw, 'Pips', [ 0, 0, 0 ])

    status.pos.lat = get(raw, 'Latitude', 0)
    status.pos.lon = get(raw, 'Longitude', 0)
    status.pos.alt = get(raw, 'Altitude', 0)
    status.pos.heading = get(raw, 'Heading', 0)
    status.pos.body = get(raw, 'BodyName', '') // ? conflicts
    status.pos.body_r = get(raw, 'PlanetRadius', 0) // ?

    raw.Flags.toString(2).padStart(32, '0')
        .split('')
        .reverse()
        .map(bit => Boolean(Number(bit || 0)))
        .forEach((f, i) => {
          if (status.is[STATUS_FLAGS_MAP[i]] !== f) status.is[STATUS_FLAGS_MAP[i]] = f
        })

    logger.log('updated')
  })

  J.on('LeaveBody', () => {
    status.pos.body_id = null
    status.pos.body = ''
  })

  J.on('ApproachBody', () => {
    status.pos.body_id = null
    status.pos.body = ''
  })
}


/**
 22:55:19 :: LeaveBody
 {
  "timestamp": "2021-03-24T20:55:19Z",
  "event": "LeaveBody",
  "StarSystem": "Redonesses",
  "SystemAddress": 3107442528962,
  "Body": "Redonesses A 1",
  "BodyID": 7
}
 22:54:11 :: ApproachBody
 {
  "timestamp": "2021-03-24T20:54:11Z",
  "event": "ApproachBody",
  "StarSystem": "Redonesses",
  "SystemAddress": 3107442528962,
  "Body": "Redonesses A 1",
  "BodyID": 7
}
 */



