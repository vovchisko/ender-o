import { reactive } from 'vue'
import uuid         from 'uuid'

const LOCAL_RACE_KEY = 'LOCAL_RACE'

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

export function start_race () {

  /*

   1 - subscribe on guidance signals
   2 - put race into active copy
   3 - set 1st point as destination.
   4 - start countdown.
   4.1 - reset countdown if leave checkpoint
   5 - take next nav point when countdown ends (start race)
   6 - each time when fires `complete` - move to next point.
   7 - on last one - show ending screen, unsibscribe

   */

}


