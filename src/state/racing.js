import { computed, reactive }                          from 'vue'
import uuid                                            from 'uuid'
import { copy_navi, guidance, guidance_signals, navi } from '@/state/navi'

const LOCAL_RACE_KEY = 'LOCAL_RACE'
const ROUND_COUNTDOWN = 5

export function blank_race () {
  return {
    id: '',
    name: 'New Race',
    is_published: false, // this means you can edit it.
    points: [],
  }
}

export function copy_race (from, to = null) {
  if (!to) to = blank_race()

  to.id = from.id
  to.name = from.name
  to.is_published = from.is_published
  to.points.splice(0)
  to.points.push(...from.points)

  return to
}

export const race = reactive(blank_race())

export function save_race () {
  if (!race.id) race.id = uuid()
  const str = JSON.stringify(race)
  localStorage.setItem(LOCAL_RACE_KEY, str)
}

export function load_race () {
  const str = localStorage.getItem(LOCAL_RACE_KEY)
  if (str) {
    try {
      const r = JSON.parse(str)
      copy_race(r, race)
    } catch (e) {
      copy_race(blank_race(), race)
    }
  }
}


// todo: this is mess. need to organize it nicely


const ROUND_STATES = Object.freeze({
  NONE: '',
  PREPARATION: 'PREPARATION',
  IN_PROGRESS: 'IN_PROGRESS',
  FINISH: 'FINISH',
})

export const round = reactive({
  state: ROUND_STATES.NONE,
  countdown: ROUND_COUNTDOWN,
  point_id: computed(() => guidance.is_active && navi.id ? navi.id : null),
  point_index: computed(() => c_race.points.findIndex(p => p.id === navi.id)),
  next_index: computed(() => {
    return c_race.points[round.point_index + 1] ? round.point_index + 1 : -1
  }),
})

// why it's outside the race?
const c_race = reactive(blank_race())

// why it so separated?
export function round_start (race) {
  round.state = ROUND_STATES.PREPARATION
  round.countdown = ROUND_COUNTDOWN
  copy_race(race, c_race)
  copy_navi(c_race.points[0], navi)
}

function round_check_point () {
  // todo: check point for back
  if (round.next_index >= 0 && c_race.points[round.next_index]) {
    // score progress measures as float value
    // int part: point index
    // floa part: amount of "true" avalues in guidance objectives
    return copy_navi(c_race.points[round.next_index], navi)
  }
}

function round_tick () {
  if (round.state === ROUND_STATES.PREPARATION) {

    if (guidance.is_complete) {
      round.countdown--
    } else {
      round.countdown = ROUND_COUNTDOWN
    }

    if (round.countdown < 0) {
      round.state = ROUND_STATES.IN_PROGRESS
      return round_check_point()
    }
  }

  if (round.state === ROUND_STATES.IN_PROGRESS) {
    if (guidance.is_complete) {
      if (round.next_index >= 0) {
        round_check_point()
      } else {
        round.state = ROUND_STATES.FINISH
      }
    }
  }
}

// cmon, we need it only for countdown. let's separate countdown instead
setInterval(round_tick, 1000)

guidance_signals.activated.on(() => {
  if (round.state) round_tick()
})

guidance_signals.completed.on(() => {
  if (round.state) round_tick()
})
