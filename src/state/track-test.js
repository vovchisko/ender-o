import { blank_navi, copy_navi, guidance, guidance_signals, navi }       from '@/state/navi'
import { blank_track, copy_track, round, ROUND_COUNTDOWN, ROUND_STATES } from '@/state/racing'

let timer = null
let sig_activate = null
let sig_complete = null

export function test_track_start (track) {
  round.state = ROUND_STATES.PREPARATION
  round.countdown = ROUND_COUNTDOWN
  copy_track(track, round.track)
  copy_navi(round.track.points[0], navi)
  timer = setInterval(() => {
    if (round.state === ROUND_STATES.PREPARATION) {
      preparation_tick()
    }

    if (round.state === ROUND_STATES.IN_PROGRESS) {
      progress_tick()
    }
  }, 100)

  sig_activate = guidance_signals.activated.on(() => {
    if (round.state) progress_tick()
  })

  sig_complete = guidance_signals.completed.on(() => {
    if (round.state) progress_tick()
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

function round_check_point () {
  if (round.next_index >= 0 && round.track.points[round.next_index]) {
    return copy_navi(round.track.points[round.next_index], navi)
  }
}

function preparation_tick () {
  if (guidance.is_complete) {
    round.countdown -= 0.1
  } else {
    round.countdown = ROUND_COUNTDOWN
  }

  if (round.countdown < 0) {
    round.state = ROUND_STATES.IN_PROGRESS
    return round_check_point()
  }
}

function progress_tick () {
  if (guidance.is_complete) {
    if (round.next_index >= 0) {
      round_check_point()
    } else {
      round.state = ROUND_STATES.FINISH
      setTimeout(() => test_track_stop(), 5000)
    }
  }
}



