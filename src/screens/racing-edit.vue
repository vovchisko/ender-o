<template>
  <div class="panel pan--left-long" v-if="ui.is_interact">
    <pre>{{ guidance }}</pre>
    <pre>{{ navi }}</pre>
    <b>RACE</b>
    <pre>{{ race }}</pre>
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

    <div class="point-actions" v-else>
      <div>
        <button @click="start_editing()">edit navigation point</button>
      </div>
      <div>
        <p v-if="!guidance.is_active">
          Set navigation destination.
        </p>

        <!--<p v-else-if="!guidance.is_complete">
          To add this point to the race - you need to reach navigation destination.
        </p>-->

        <button v-else-if="navi.id" @click="point_save">save this point</button>
        <button v-else @click="point_add">+ add this point to race</button>
      </div>
    </div>
  </div>


  <div class="panel pan--right-long">
    <button @click="save_race()">save changes</button>
    <button @click="race_clear()">clear race</button>

    <h3>points</h3>
    <div v-for="(p, i) in race.points">
      <p>{{ i }} / {{ p.id }} / {{ p.type }}</p>
      <button @click="start_editing(p)">edit</button>
    </div>
  </div>
</template>

<script>
import { ref }                                               from 'vue'
import uuid                                                  from 'uuid'
import { status }                                            from '@/state/status'
import { blank_navi, copy_navi, DEST_TYPE, guidance, navi }  from '@/state/navi'
import { ui, UI_PANELS }                                     from '@/state/ui'
import { blank_race, copy_race, load_race, race, save_race } from '@/state/racing'

import NaviEditor     from '@/components/navi-editor'
import GuideHeading   from '@/components/guide-heading'
import GuideObjective from '@/components/guide-objective'

export default {
  name: 'racing-edit',
  components: { GuideObjective, GuideHeading, NaviEditor },

  setup () {
    load_race()

    const is_edit = ref(false)
    const editing = ref(blank_navi())

    return {
      is_edit, editing, race, save_race,
      status, guidance, navi, ui,
      UI_PANELS, DEST_TYPE,
    }
  },

  methods: {
    apply_destination (new_editing) {
      copy_navi(new_editing, navi)
      this.is_edit = false
      if (navi.id) this.point_save()
    },

    start_editing (point = null) {
      copy_navi(point || navi, this.editing)
      this.is_edit = true
    },

    clear_destination () {
      this.apply_destination(blank_navi())
    },

    point_add () {
      navi.id = uuid()
      race.points.push(copy_navi(navi))
      this.clear_destination()
    },

    point_save () {
      const i = race.points.findIndex(p => p.id === navi.id)
      if (i > -1) race.points[i] = copy_navi(navi)
      this.clear_destination()
    },

    race_clear () {
      copy_race(blank_race(), race)
    },
  },
}
</script>
<style lang="scss" scoped>
.point-actions {
  display: flex;
  div {
    flex: 1;
  }
}
</style>
