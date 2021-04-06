import Signal from 'a-signal'

import { computed, reactive, watch } from 'vue'
import { status }                    from '@/state/status'

const PI = Math.PI

export const DEST_TYPE = Object.freeze({
  SYSTEM: 'SYSTEM', // visit the system
  APPROACH: 'APPROACH', // approach the body
  PLANETARY: 'PLANETARY', // planetary position
  DOCK: 'DOCK', // dock on the station
})

export function blank_navi () {
  return {
    id: '',
    label: '',
    type: DEST_TYPE.SYSTEM,
    approach: '',
    required: {
      ship_model: '',
      transport: '',
    },
    dest: {
      system: '',
      planet: '',
      docked: '',
      lon: null,
      lat: null,
      alt: null,
      min_dist: 0,
    },
  }
}

export function copy_navi (from, to = null, skip_id = false) {
  if (!to) to = blank_navi()

  if (!skip_id) to.id = from.id

  to.label = from.label
  to.type = from.type
  to.approach = from.approach

  Object.assign(to.required, from.required)
  Object.assign(to.dest, from.dest)

  return to
}

export const navi = reactive(blank_navi())

export const guidance = reactive({
  is_head_active: false,
  is_heading_err: false,
  heading: 0,
  distance: 0,
  reach_distance: computed(
      () => guidance.is_head_active
          ? guidance.distance - navi.dest.min_dist
          : null,
  ),
  objectives: {
    transport: computed(() => {
      return navi.required.transport
          ? status.transport === navi.required.transport
          : null
    }),
    system: computed(() => {
      return navi.dest.system
          ? navi.dest.system === status.pos.system
          : null
    }),
    approach: computed(() => {
      return navi.approach
          ? navi.approach === status.near.body
          : null
    }),
    planet: computed(() => {
      return navi.dest.planet
          ? navi.dest.planet === status.pos.planet
          : null
    }),
    docked: computed(() => {
      return navi.dest.docked
          ? navi.dest.docked === status.docked.name
          : null
    }),
    position: computed(() => {
      if (navi.type !== DEST_TYPE.PLANETARY) return null
      return Boolean(
          (navi.dest.lon && navi.dest.lat) &&
          (navi.dest.min_dist >= guidance.distance),
      )
    }),
  },
  is_active: computed(() => {
    return (
        guidance.objectives.transport !== null ||
        guidance.objectives.system !== null ||
        guidance.objectives.approach !== null ||
        guidance.objectives.planet !== null ||
        guidance.objectives.docked !== null ||
        guidance.objectives.position !== null
    )
  }),
  is_complete: computed(() => {
    return (
        guidance.objectives.transport !== false &&
        guidance.objectives.system !== false &&
        guidance.objectives.approach !== false &&
        guidance.objectives.planet !== false &&
        guidance.objectives.docked !== false &&
        guidance.objectives.position !== false
    )
  }),
})

export const guidance_signals = {
  activated: new Signal(),
  completed: new Signal(),
}

const upd_planetary_guidance = () => {
  let lat_start,
      lot_start,
      lat_dest,
      lon_dest,
      d_lon,
      d_lat,
      init_bear,
      dist,
      heading

  lat_start = status.pos.lat * PI / 180
  lot_start = status.pos.lon * PI / 180
  lat_dest = navi.dest.lat * PI / 180
  lon_dest = navi.dest.lon * PI / 180

  d_lon = lon_dest - lot_start
  d_lat = Math.log(Math.tan(PI / 4 + lat_dest / 2) / Math.tan(PI / 4 + lat_start / 2))

  init_bear = (Math.atan2(d_lon, d_lat)) * (180 / PI)

  if (init_bear < 0) init_bear = 360 + init_bear

  dist = Math.floor((
      Math.acos(
          Math.sin(lat_start) *
          Math.sin(lat_dest) +
          Math.cos(lat_start) *
          Math.cos(lat_dest) *
          Math.cos(d_lon),
      ) * status.pos.planet_r
  ) * 1000) / 1000

  heading = Math.floor(init_bear)

  if (isNaN(heading)) {
    guidance.is_heading_err = true
    guidance.heading = 0
    guidance.distance = 0
  } else {
    guidance.is_heading_err = false
    guidance.heading = heading
    guidance.distance = dist
    guidance.deviation = Math.abs(guidance.heading - status.pos.heading)
  }
}


watch([ status, navi ], () => {
  if (
      navi.type !== DEST_TYPE.PLANETARY ||
      navi.dest.lon === null || navi.dest.lat === null || status.pos.alt === null
  ) {
    guidance.is_head_active = false
    guidance.is_heading_err = false
  } else {
    guidance.is_heading_err = false
    guidance.is_head_active = true
    upd_planetary_guidance()
  }
}, { immediate: true, deep: true })

watch(
    () => ({ ...guidance }),
    (curr, prev) => {
      if (!prev.is_active && curr.is_active) guidance_signals.activated.emit()
      if (!prev.is_complete && curr.is_complete) guidance_signals.completed.emit()
    },
)
