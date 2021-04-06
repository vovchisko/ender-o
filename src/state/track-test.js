import { copy_navi, guidance, guidance_signals, navi }      from '@/state/navi'
import { copy_track, round, ROUND_COUNTDOWN, ROUND_STATES } from '@/state/racing'


export function round_start (tr) {
  round.state = ROUND_STATES.PREPARATION
  round.countdown = ROUND_COUNTDOWN
  copy_track(tr, round.track)
  copy_navi(round.track.points[0], navi)
}

function round_check_point () {
  if (round.next_index >= 0 && round.track.points[round.next_index]) {
    return copy_navi(round.track.points[round.next_index], navi)
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

setInterval(round_tick, 1000)

guidance_signals.activated.on(() => {
  if (round.state) round_tick()
})

guidance_signals.completed.on(() => {
  if (round.state) round_tick()
})
