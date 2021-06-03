import { reactive } from 'vue'
import { J }        from '@/modules/journal'

let counter = 0

const MAX_RECORDS = 200

export const raw_records = reactive([])
export const raw_data = reactive({})

export function dev_cache_init () {
  J.on('record', (event, rec) => {
    raw_records.unshift({ event, rec, expanded: false, id: ++counter })
    if (raw_records.length > MAX_RECORDS) raw_records.length = MAX_RECORDS
  })

  J.on('data', (event, rec) => {
    if (!raw_data[event]) {
      raw_data[event] = { event, rec, expanded: false, id: event }
    } else {
      raw_data[event].rec = rec
    }
  })
}
