<template>
  <h3>DEV TOOLS</h3>

  <div class="cols">
    <div class="col">
      <div class="block">
        <b class="caps">DATA</b>
        <div v-for="e in data">
          <pre @click="e.expanded = !e.expanded">{{ rec_dt(e.rec.timestamp) }} :: {{ e.event }}</pre>
          <pre v-if="e.expanded">{{ e.rec }}</pre>
        </div>
      </div>

      <div class="block">
        <b class="caps">JOURNAL</b>
        <div v-for="e in records">
          <pre @click="e.expanded = !e.expanded">{{ rec_t(e.rec.timestamp) }} :: {{ e.event }}</pre>
          <pre v-if="e.expanded">{{ e.rec }}</pre>
        </div>
      </div>
    </div>
    <div class="col">
      <div class="block">
        <b class="caps">COMPUETD STATUS</b>
        <pre>{{ status }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import { status }        from '@/state/status'
import { J }             from '@/modules/journal'
import { reactive }      from 'vue'
import { ui }            from '@/state/ui'
import { rec_dt, rec_t } from '@/helpers/date_formaters'

export default {
  name: 'development',
  setup () {
    let counter = 0
    const records = reactive([])
    const data = reactive({})

    J.on('record', (event, rec) => {
      records.unshift({ event, rec, expanded: false, id: ++counter })
      if (records.length > 100) records.length = 100
    })

    J.on('data', (event, rec) => {
      if (!data[event]) {
        data[event] = { event, rec, expanded: false, id: event }
      } else {
        data[event].rec = rec
      }
    })

    return { status, records, data, ui, rec_t, rec_dt }
  },
}
</script>
<style lang="scss" scoped="true">
.cols {
  font-size: 1.1vh;
  text-shadow: 0 0 2px black;
  color: orange;
  display: flex;
  justify-content: space-between;

  .col {

  }

  pre {
    margin: 0;
    padding: 0.1em;
  }

  .block {
    @include scrollbar-awesome();

    margin: 1em;
    overflow: auto;

    b { font-size: 1.2em; }
  }
}
</style>
