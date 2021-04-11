import { blank_navi, copy_navi, guidance, guidance_signals, navi }       from '@/state/navi'
import { blank_track, copy_track, round, ROUND_COUNTDOWN, ROUND_STATES } from '@/state/racing'

const ROUND_TICK_LENGH = 69

let timer = null
let sig_activate = null
let sig_complete = null
let last_tick_time = Date.now()
let last_tick_delta = 0
let preparation_ticks = 0

export function test_track_start (track) {
  preparation_ticks = 2000 / ROUND_TICK_LENGH

  round.state = ROUND_STATES.PREPARATION
  round.countdown = ROUND_COUNTDOWN
  round.start_time = Date.now()
  round.start_time = Date.now()
  copy_track(track, round.track)
  copy_navi(round.track.points[0], navi)


  timer = setInterval(() => {
    last_tick_delta = Date.now() - last_tick_time
    last_tick_time = last_tick_delta + last_tick_time

    if (round.state === ROUND_STATES.PREPARATION) return preparation_tick()
    if (round.state === ROUND_STATES.COUNTDOWN) return countdown_tick()
    if (round.state === ROUND_STATES.IN_PROGRESS) return progress_tick()

  }, ROUND_TICK_LENGH)

  sig_activate = guidance_signals.activated.on(() => {
    if (round.state === ROUND_STATES.IN_PROGRESS) progress_tick()
  })

  sig_complete = guidance_signals.completed.on(() => {
    if (round.state === ROUND_STATES.IN_PROGRESS) progress_tick()
  })
}

export function test_track_stop () {
  round.state = ROUND_STATES.NONE
  if (sig_activate) sig_activate.off()
  if (sig_complete) sig_complete.off()
  clearInterval(timer)
  copy_track(blank_track(), round.track)
  copy_navi(blank_navi(), navi)
}

function preparation_tick () {
  if (guidance.is_complete && (--preparation_ticks) <= 0) {
    round.state = ROUND_STATES.COUNTDOWN
  } else {
    round.state = ROUND_STATES.PREPARATION
    round.countdown = ROUND_COUNTDOWN
  }
}

function countdown_tick () {
  if (round.countdown < 0) {
    round.state = ROUND_STATES.IN_PROGRESS
  }else {
    round.countdown -= last_tick_delta
  }
}

function progress_tick () {
  if (guidance.is_complete) {
    if (round.next_index >= 0) {
      round_check_point()
    } else {
      round.state = ROUND_STATES.FINISH
      round.finish_time = Date.now()
      setTimeout(() => test_track_stop(), 15000)
    }
  }
}

function round_check_point () {
  if (round.next_index >= 0 && round.track.points[round.next_index]) {
    return copy_navi(round.track.points[round.next_index], navi)
  }
}




