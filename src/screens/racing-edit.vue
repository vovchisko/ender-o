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
    <navi-edit v-if="is_edit"
               @apply="edit_apply"
               @cancel="edit_cancel"
               :editing="editing"
    />

    <div class="point-actions" v-else>
      <button @click="point_edit()">edit navigation point</button>
      <button @click="navi_clear()" v-if="guidance.is_head_active">clear guidance</button>
    </div>
  </div>


  <div class="panel pan--right-long">
    <button @click="race_save()">save changes</button>
    <button @click="race_clear()">clear race</button>

    <h3>points</h3>
    <div v-for="(p, i) in race.points">
      <p>{{ i }} / {{ p.id }} / {{ p.type }}</p>
      <button @click="point_edit(p)" :class="{active: editing.id === p.id}">edit</button>
      <button @click="point_test(p)" :class="{active: navi.id === p.id}">test</button>
      <button @click="point_delete(p)">delete</button>
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

import NaviEdit       from '@/components/navi-edit'
import GuideHeading   from '@/components/guide-heading'
import GuideObjective from '@/components/guide-objective'

export default {
  name: 'racing-edit',
  components: { GuideObjective, GuideHeading, NaviEdit },

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
    edit_apply (new_editing) {
      this.is_edit = false

      if (new_editing.id) {
        const i = race.points.findIndex(p => p.id === new_editing.id)
        if (i >= 0) race.points[i] = copy_navi(new_editing)
      } else {
        new_editing.id = uuid()
        race.points.push(copy_navi(new_editing))
      }
    },

    point_test (point) {
      copy_navi(point, navi)
    },

    edit_cancel () {
      copy_navi(blank_navi(), this.editing)
      this.is_edit = false
    },

    point_delete (point) {
      const i = race.points.findIndex(p => p.id === point.id)
      if (i >= 0) race.points.splice(i, 1)
    },

    point_edit (point = null) {
      copy_navi(point || navi, this.editing)
      this.is_edit = true
    },

    navi_clear () {
      copy_navi(blank_navi(), navi)
    },

    race_save () {
      this.save_race()
    },

    race_clear () {
      copy_race(blank_race(), race)
    },
  },
}
</script>
<style lang="scss" scoped>
.point-actions {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-gap: 1rem;

}
</style>
