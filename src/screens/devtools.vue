<template>
  <div class="cols">
    <div class="col">
      <div class="block">
        <b class="caps">DATA</b>
        <div v-for="e in data" :class="e.expanded ? 'expanded':''" class="rec">
          <pre @click="e.expanded = !e.expanded">{{ rec_dt(e.rec.timestamp) }} :: {{
              e.event }}</pre>
          <pre v-if="e.expanded">{{ e.rec }}</pre>
        </div>
      </div>
      <div class="block">
        <b class="caps">JOURNAL</b>
        <div v-for="e in records" class="rec">
          <pre @click="e.expanded = !e.expanded">{{ rec_t(e.rec.timestamp) }} :: {{
              e.event }}</pre>
          <pre v-if="e.expanded">{{ e.rec }}</pre>
        </div>
      </div>
    </div>
    <div class="col wide">
      test
      <button @click="try_send">try net</button>
      {{ net_stat }}
    </div>
    <div class="col">
      <div class="block">
        <b class="caps">STATUS</b>
        <pre>{{ status }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive }      from 'vue'
import { J }             from '@/modules/journal'
import { status }        from '@/state/status'
import { ui }            from '@/state/ui'
import { rec_dt, rec_t } from '@/helpers/formaters'
import NaviEdit          from '@/components/navi-edit'
import GuidanceBar       from '@/components/guide-heading'
import Racing            from '@/screens/racing'
import { net }           from '@/modules/net'

export default {
  name: 'development',
  components: { Racing, GuidanceBar, NaviEdit },
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

    return { net_stat: net.status, status, records, data, ui, rec_t, rec_dt }
  },
  methods: {
    try_send () {
      net.send('test', { some: 'payload' })
    },
  },
}
</script>
<style lang="scss" scoped="true">
.screen-title {
  @include typo-caps(400);
}

.cols {
  display: flex;

  justify-content: space-between;
  max-height: 100%;
  color: orange;

  .guidance-heading {
    max-width: 700px;
    margin: 0 auto;
  }

  .col {
    display: flex;
    flex: 1;
    flex-direction: column;
    max-height: 100%;

    &.wide {
      flex: 2
    }

    .block {
      @include scrollbar-awesome();

      min-height: 15%;
      margin: 1rem;

      b {
        font-size: 1.2rem;
      }

      .rec:hover {
        color: #ffba52;
      }

      .rec.expanded {
        color: #ffdaa3 !important;
      }

      pre {
        line-height: 1;
        margin: 0;
        padding: 0.2rem;
      }
    }
  }
}
</style>
