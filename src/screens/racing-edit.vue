<template>
  <div class="panel pan--left-long">
    <pre>{{ guidance }}</pre>
    <pre>{{ navi }}</pre>
  </div>

  <!--
    <div class="panel pan&#45;&#45;right-long">
      <pre slot="right-long">{{ status }}</pre>
    </div>
  -->

  <div class="panel pan--heading-objectives" v-if="navi.is_set">
    <guide-info />

  </div>
  <div class="panel pan--heading"
       v-if="navi.is_set && navi.type === DEST_TYPE.PLANETARY">
    <guide-heading />
  </div>
  <div v-if="show_edit" class="panel pan--central-main">
    <navi-editor @apply="apply_destination" @cancel="show_edit = false" />
  </div>

  <div v-if="!show_edit" class="panel pan--bottom">
    <button @click="clear_destination" v-if="navi.is_set">CLEAR</button>
    <button @click="show_edit = true">EDIT</button>
  </div>
</template>

<script>
import { ref }                                   from 'vue'
import { status }                                from '@/state/status'
import { DEST_TYPE, guidance, navi, navi_reset } from '@/state/navi'
import { UI_PANELS }                             from '@/state/ui'
import NaviEditor                                from '@/components/navi-editor'
import GuideHeading                              from '@/components/guide-heading'
import GuideInfo                                 from '@/components/guide-objective'

export default {
  name: 'racing-edit',
  components: { GuideInfo, GuideHeading, NaviEditor },
  setup () {
    const show_edit = ref(false)

    return {
      show_edit,
      status, guidance, navi,
      UI_PANELS,
      DEST_TYPE,
    }
  },
  methods: {
    apply_destination (new_navi) {
      navi.is_set = true

      navi.type = new_navi.type
      navi.approach = new_navi.approach
      Object.assign(navi.required, new_navi.required)
      Object.assign(navi.dest, new_navi.dest)

      this.show_edit = false
    },

    clear_destination () {
      navi_reset()
    },
  },
}
</script>
<style lang="scss" scoped="true">

</style>
