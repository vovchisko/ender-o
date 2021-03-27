import { computed, reactive, watch } from 'vue'
import { status }                    from '@/state/status'
import Signal from 'a-signal'

const PI = Math.PI

export const DEST_TYPE = Object.freeze({
  SYSTEM: 'SYSTEM',
  APPROACH: 'APPROACH',
  BODY: 'BODY',
  PLANETARY: 'PLANETARY',
  DOCK: 'DOCK',
})

export const navi = reactive({
  is_set: false,
  type: DEST_TYPE.SYSTEM,
  required: {
    ship_model: '',
    transport: '',
  },
  dest: {
    system: '',
    planet: '',
    docked: '',
    lon: 0,
    lat: 0,
    alt: 0,
    min_dist: 0,
  },
})

// outter buffer vars


export const guidance = reactive({
  is_head_active: false,
  is_heading_err: false,
  head: 0,
  distance: 0,
  is_transport_ok: computed(() => {
    return navi.required.transport
        ? status.transport === navi.required.transport
        : true
  }),
  is_system_ok: computed(() => {
    return navi.dest.system
        ? navi.dest.system === status.pos.system
        : true
  }),
  is_planet_ok: computed(() => {
    return navi.dest.planet
        ? navi.dest.planet === status.pos.planet
        : true
  }),
  is_pos_ok: computed(() => {
    if (navi.type !== DEST_TYPE.PLANETARY) return true
    return (
        (navi.dest.alt && navi.dest.alt >= status.pos.alt) &&
        (navi.dest.min_dist >= guidance.distance)
    )
  }),

})


const upd_planetary_guidance = () => {
  guidance.is_head_active = true

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
  if (!navi.is_set || navi.type !== DEST_TYPE.PLANETARY || !navi.dest.lon || !navi.dest.lat || !status.pos.alt) {
    //      ^                          ^                                        ^                         ^                    //
    //      |                          |                                        |                         |                    //
    //   destination set      and in rhight mode                  destination includes coords         status show alt          //
    //                                                                  (maybe redunant)           (meand on the planet)       //

    guidance.is_head_active = false
  } else {
    guidance.is_head_active = true
    upd_planetary_guidance()
  }

}, { immediate: true, deep: true })

