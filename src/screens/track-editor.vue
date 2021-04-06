<template>
  <div class="panel pan--left-long">
    <pre>{{ guidance }}</pre>
    <b>RACE</b>
    <pre>{{ round }}</pre>
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
      <button @click="point_add()">add navigation point</button>
      <button @click="point_edit()" v-if="navi.id">edit this point</button>
      <button @click="navi_clear()" v-if="guidance.is_active">clear guidance</button>
    </div>
  </div>

  <div class="panel pan--right-long">
    <button @click="track_save()">save changes</button>
    <button @click="track_clear()">clear track</button>
    <button v-if="!round.state">test track</button>

    <h3>points</h3>
    <div v-for="(p, i) in track.points">
      <p>{{ i }} / {{ p.id }} / {{ p.type }}</p>
      <button @click="point_edit(p)" :class="{active: editing.id === p.id}">edit</button>
      <button @click="point_test(p)" :class="{active: navi.id === p.id}">test</button>
      <button @click="point_delete(p)">delete</button>
    </div>
  </div>
</template>

<script>

import { reactive, ref }                                    from 'vue'
import { ui, UI_PANELS }                                    from '@/state/ui'
import { status }                                           from '@/state/status'
import { blank_navi, copy_navi, DEST_TYPE, guidance, navi } from '@/state/navi'
import { blank_track, copy_track, round }                   from '@/state/racing'

import NaviEdit       from '@/components/navi-edit'
import GuideHeading   from '@/components/guide-heading'
import GuideObjective from '@/components/guide-objective'
import uuid           from 'uuid'

const LOCAL_RACE_KEY = 'LOCAL_RACE'

// just to make id still id but easy to read/remember
const format_id = (id) => Number(id).toString(16).padStart(3, '0')
const point_id = ({ points }) => {
  let id_rc = 1
  const ids = points.map(p => p.id)
  while (ids.includes(format_id(id_rc))) id_rc++
  return format_id(id_rc)
}

export default {
  name: 'racing-edit',
  components: { GuideObjective, GuideHeading, NaviEdit },

  setup () {
    const track = reactive(blank_track())
    const is_edit = ref(false)
    const editing = ref(blank_navi())

    return {
      is_edit, editing, track,
      round,
      status, guidance, navi, ui,
      UI_PANELS, DEST_TYPE,
    }
  },
  mounted () {
    this.load_race()
  },
  unmounted () {
    this.save_race()
  },
  methods: {
    edit_apply (new_editing) {
      this.is_edit = false

      if (new_editing.id) {
        const i = this.track.points.findIndex(p => p.id === new_editing.id)
        if (i >= 0) this.track.points[i] = copy_navi(new_editing)
      } else {
        new_editing.id = point_id(this.track)
        this.track.points.push(copy_navi(new_editing))
      }
    },

    point_test (point) {
      if (point.id === navi.id) {
        this.navi_clear()
      } else {
        copy_navi(point, navi)
      }
    },

    edit_cancel () {
      copy_navi(blank_navi(), this.editing)
      this.is_edit = false
    },

    point_delete (point) {
      this.navi_clear()
      this.edit_cancel()
      const i = this.track.points.findIndex(p => p.id === point.id)
      if (i >= 0) this.track.points.splice(i, 1)
      let id_rc = 1
      this.track.points.forEach(p => p.id = format_id(id_rc++))
    },

    point_add () {
      this.navi_clear()
      this.point_edit()
    },

    point_edit (point = null) {
      if (point && point.id === this.editing.id) {
        copy_navi(blank_navi(), this.editing)
        this.is_edit = false
      } else if (point) {
        copy_navi(point, this.editing)
        this.is_edit = true
      } else {
        copy_navi(navi, this.editing)
        this.is_edit = true
      }
    },

    navi_clear () {
      copy_navi(blank_navi(), navi)
      copy_navi(navi, this.editing)
    },

    track_save () {
      this.save_race()
    },

    track_clear () {
      copy_track(blank_track(), this.track)
    },

    save_race () {
      if (!this.track.id) this.track.id = uuid()
      const str = JSON.stringify(this.track)
      localStorage.setItem(LOCAL_RACE_KEY, str)
    },

    load_race () {
      const str = localStorage.getItem(LOCAL_RACE_KEY)
      if (str) {
        try {
          const r = JSON.parse(str)
          copy_track(r, this.track)
        } catch (e) {
          copy_track(blank_track(), this.track)
        }
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.point-actions {
  display: flex;
  justify-content: center;

  button {
    margin: 0 1rem;
  }
}
</style>
