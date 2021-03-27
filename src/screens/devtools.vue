<template>
  <div class="cols">
    <!--<div class="col">
      <div class="block">
        <b class="caps">DATA</b>
        <div v-for="e in data" class="rec" :class="e.expanded ? 'expanded':''">
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
    </div>-->

    <div class="col">
      <div class="block">
        <guidance-bar class="guidance-bar"/>
      </div>
      <div class="block">
        <dest-editor />
      </div>
    </div>
    <!--<div class="col">
      <div class="block">
        <b class="caps">COMPUETD STATUS</b>
        <pre>{{ status }}</pre>
      </div>
    </div>-->
  </div>
</template>

<script>
import { reactive }      from 'vue'
import { J }             from '@/modules/journal'
import { status }        from '@/state/status'
import { ui }            from '@/state/ui'
import { rec_dt, rec_t } from '@/helpers/formaters'
import DestEditor        from '@/components/dest-editor'
import GuidanceBar       from '@/components/guidance-bar'

export default {
  name: 'development',
  components: { GuidanceBar, DestEditor },
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
.screen-title {
  @include typo-caps(400);
}

.cols {
  color: orange;

  display: flex;
  justify-content: space-between;
  max-height: 100%;

  .guidance-bar { margin: 0 auto; max-width: 700px; }

  .col {
    flex: 1;
    display: flex;
    flex-direction: column;
    max-height: 100%;

    .block {
      @include scrollbar-awesome();

      margin: 1rem;
      overflow: auto;
      min-height: 15%;

      b { font-size: 1.2rem; }


      .rec:hover {
        color: #ffba52;
      }

      .rec.expanded {
        color: #ffdaa3 !important;
      }

      pre {
        margin: 0;
        padding: 0.2rem;
        line-height: 1;
      }
    }
  }
}
</style>
