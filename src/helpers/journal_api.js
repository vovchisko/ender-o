export const J_LEGAL_STATE = {
  CLEAN: 'Clean',
  ILLEGAL_CARGO: 'IllegalCargo',
  SPEEDING: 'Speeding',
  WANTED: 'Wanted',
  HOSTILE: 'Hostile',
  PASSENGER_WANTED: 'PassengerWanted',
  WARRANT: 'Warrant',
}
export const J_GUI_FOCUS = {
  NO_FOCUS: 0,    // NoFocus
  INT_RIGHT: 1,   // InternalPanel (right hand side)
  EXT_LEFT: 2,    // ExternalPanel (left hand side)
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

export const J_FLAGS_MAP = [
  'Docked',                     // 0   1           Docked, (on a landing pad)
  'Landed',                     // 1   2           Landed, (on planet surface)
  'LandingGearRetracted',       // 2   4           Landing Gear Down
  'ShieldsUp',                  // 3   8           Shields Up
  'Supercruise',                // 4   16          Supercruise
  'FlightAssistOff',            // 5   32          FlightAssist Off
  'HardpointsDeployed',         // 6   64          Hardpoints Deployed
  'InWing',                     // 7   128         In Wing
  'LightsOn',                   // 8   256         LightsOn
  'CargoScoopDeployed',         // 9   512         Cargo Scoop Deployed
  'SilentRunning',              // 10  1024        Silent Running,
  'ScoopingFuel',               // 11  2048        Scooping Fuel
  'SrvHandbrake',               // 12  4096        Srv Handbrake
  'SrvTurretView',              // 13  8192        Srv using Turret view
  'SrvTurretRetracted',         // 14  16384       Srv Turret retracted (close to ship)
  'SrvDriveAssist',             // 15  32768       Srv DriveAssist
  'FsdMassLocked',              // 16  65536       Fsd MassLocked
  'FsdCharging',                // 17  131072      Fsd Charging
  'FsdCooldown',                // 18  262144      Fsd Cooldown
  'LowFuel',                    // 19  524288      Low Fuel ( < 25% )
  'OverHeating',                // 20  1048576     Over Heating ( > 100% )
  'HasLatLong',                 // 21  2097152     Has Lat Long
  'IsInDanger',                 // 22  4194304     IsInDanger
  'BeingInterdicted',           // 23  8388608     Being Interdicted
  'InMainShip',                 // 24  16777216    In MainShip
  'InFighter',                  // 25  33554432    In Fighter
  'InSRV',                      // 26  67108864    In SRV
  'HudAnalysisMode',            // 27  134217728   Hud in Analysis mode
  'NightVision',                // 28  268435456   Night Vision
  'AltitudeFromAverageRadius',  // 29  536870912   Altitude from Average radius
  'fsdJump',                    // 30  1073741824  fsdJump
  'srvHighBeam',                // 31  2147483648  srvHighBeam
]

export const J_BODY_TYPE = {
  NULL: 'Null',
  START: 'Star',
  PLANET: 'Planet',
}

export const J_JUMP_TYPE = {
  HYPERSPACE: 'Hyperspace',
  SUPERCRUISE: 'Supercruise',
}

export const extract = {

  body_type: BodyType => {
    return !BodyType || BodyType === 'Null' ? '' : BodyType
  },

  flags: (Flags, target = {}) => {
    Flags.toString(2).padStart(32, '0')
        .split('')
        .reverse()
        .map(bit => Boolean(Number(bit || 0)))
        .forEach((f, i) => {
          if (target[J_FLAGS_MAP[i]] !== f) target[J_FLAGS_MAP[i]] = f
        })
  },

  stellar_name: (str) => str ? str.toLowerCase() : ''
}
