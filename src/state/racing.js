import { computed, reactive } from 'vue'
import { guidance, navi }     from '@/state/navi'

export const ROUND_COUNTDOWN = 5000
export const ROUND_STATES = Object.freeze({
  NONE: '',
  PREPARATION: 'PREPARATION',
  COUNTDOWN: 'COUNTDOWN',
  IN_PROGRESS: 'IN_PROGRESS',
  FINISH: 'FINISH',
})

export function blank_track () {
  return {
    id: '',
    name: 'New Race',
    is_published: false, // this means you can edit it.
    points: [],
  }
}

export function copy_track (from, to = null) {
  if (!to) to = blank_track()
  to.id = from.id
  to.name = from.name
  to.is_published = from.is_published
  to.points.splice(0)
  to.points.push(...from.points)
  return to
}

export const round = reactive({
  state: ROUND_STATES.NONE,
  start_time: 0,
  finish_time: 0,
  is_test: computed(() => !round.track.is_published),
  countdown: ROUND_COUNTDOWN,
  point_id: computed(() => guidance.is_active && navi.id ? navi.id : null),
  point_index: computed(() => round.track.points.findIndex(p => p.id === navi.id)),
  next_index: computed(() => round.track.points[round.point_index + 1]
      ? round.point_index + 1
      : -1,
  ),
  track: blank_track(),
})
