<template>
  <div class="cols">
    <div class="col">
      <b class="caps">JOURNAL</b>
      <div v-for="e in raw_records" class="rec">
        <pre @click="e.expanded = !e.expanded">{{ rec_t(e.rec.timestamp) }} :: {{ e.event }}</pre>
        <pre v-if="e.expanded">{{ e.rec }}</pre>
      </div>

    </div>
    <div class="col">
      <b class="caps">DATA</b>
      <div v-for="e in raw_data" :class="e.expanded ? 'expanded':''" class="rec">
        <pre @click="e.expanded = !e.expanded">{{ rec_dt(e.rec.timestamp) }} :: {{ e.event }}</pre>
        <pre v-if="e.expanded">{{ e.rec }}</pre>
      </div>
    </div>
    <div class="col wide">
      raw data
    </div>
    <div class="col">
      <b class="caps">STATUS</b>
      <pre>{{ status }}</pre>
    </div>
  </div>
</template>

<script>

import { raw_data, raw_records } from '@/state/dev-cache'
import { status }                from '@/state/status'
import { ui }                    from '@/state/ui'
import { rec_dt, rec_t }         from '@/helpers/formaters'
import NaviEdit                  from '@/components/navi-edit'
import GuidanceBar               from '@/components/guide-heading'
import Racing                    from '@/screens/racing'

export default {
  name: 'development',
  components: { Racing, GuidanceBar, NaviEdit },
  setup () {


    return { status, raw_data, raw_records, ui, rec_t, rec_dt }
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

  .col {
    display: flex;
    flex: 1;
    flex-direction: column;
    max-height: 100%;

    @include scrollbar-awesome();
    overflow: auto;


    &.wide {
      flex: 2
    }

    .block {

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
