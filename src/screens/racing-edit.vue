<template>
  <div class="panel pan--left-long" v-if="ui.is_interact">
    <pre>{{ guidance }}</pre>
    <pre>{{ navi }}</pre>
  </div>

  <div class="panel pan--heading-objectives" v-if="guidance.is_active">
    <guide-objective />
  </div>

  <div class="panel pan--heading"
       v-if="guidance.is_active && navi.type === DEST_TYPE.PLANETARY">
    <guide-heading />
  </div>

  <div class="panel pan--central-main" v-if="ui.is_interact">
    <navi-editor
        v-if="is_edit"
        @apply="apply_destination"
        @cancel="is_edit = false"
        @clear="clear_destination"
        :editing="editing"
    />
    <button v-else @click="start_editing()">edit navigation point</button>
  </div>
</template>

<script>
import { ref } from 'vue'

import { status }                                            from '@/state/status'
import { apply_navi, blank_navi, DEST_TYPE, guidance, navi } from '@/state/navi'
import { ui, UI_PANELS }                                     from '@/state/ui'

import NaviEditor     from '@/components/navi-editor'
import GuideHeading   from '@/components/guide-heading'
import GuideObjective from '@/components/guide-objective'

export default {
  name: 'racing-edit',
  components: { GuideObjective, GuideHeading, NaviEditor },

  setup () {
    const is_edit = ref(false)

    const editing = ref(blank_navi())

    return {
      is_edit, editing,
      status, guidance, navi, ui,
      UI_PANELS, DEST_TYPE,
    }
  },

  methods: {
    apply_destination (new_editing) {
      navi.is_set = true
      apply_navi(new_editing, navi)
      this.is_edit = false
    },
    start_editing (point = null) {
      apply_navi(point || navi, this.editing)
      this.is_edit = true
    },
    clear_destination () {
      this.apply_destination(blank_navi())
    },
  },
}
</script>
<style lang="scss" scoped="true">

</style>
