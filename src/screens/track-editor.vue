<template>
  <div class="panel pan--right-long" v-if="ui.is_interact">
    <b>GUIDANCE</b>
    <pre>{{ guidance }}</pre>
    <b>ROUND</b>
    <pre>{{ {
      ...round,
      track: {
        ...round.track, points: `array(${ round.track.points.length })`,
      },
    } }}</pre>
    <b>navi</b>
    <pre>{{ navi }}</pre>
  </div>

  <guide-objective v-if="guidance.is_active" />
  <guide-heading v-if="guidance.is_active && guidance.objectives.planet === true" />

  <div class="panel pan--central-main" v-if="ui.is_interact">
    <navi-edit v-if="is_edit"
               @apply="edit_apply"
               @cancel="edit_cancel"
               :editing="editing"
    />
    <div class="track__curr-point-actions" v-else>
      <button @click="point_add()">add navigation point</button>
      <button @click="point_edit()" v-if="navi.id">edit this point</button>
      <button @click="navi_clear()" v-if="guidance.is_active">clear guidance</button>
    </div>
  </div>

  <div class="panel pan--left-long track" v-if="ui.is_interact">
    <div class="track__actions">
      <button @click="track_save()">save changes</button>
      <button @click="track_clear()">clear track</button>
      <button v-if="!round.state" @click="test_track_start(track)" :disabled="track.points.length < 2">
        test track
      </button>
      <button v-if="round.state" @click="test_track_stop()" class="active">test stop</button>
    </div>

    <h3>points</h3>
    <p v-if="!track.points.length">
      Track has no points.<br>
      Race should have at least 2 points.<br>
    </p>

    <div class="track__point" v-for="(p, i) in track.points">
      <p>{{ i }} / {{ p.id }} / {{ p.type }} / {{ p.label }}</p>
      <div class="track__point-actions">
        <button @click="point_delete(p)" class="delete">delete</button>
        <button @click="point_edit(p)" :class="{active: editing.id === p.id}">edit</button>
        <button @click="point_test(p)" :class="{active: navi.id === p.id}">test</button>
      </div>
    </div>
  </div>
</template>

<script>

import { reactive, ref }                                    from 'vue'
import { ui, UI_PANELS }                                    from '@/state/ui'
import { status }                                           from '@/state/status'
import { blank_navi, copy_navi, DEST_TYPE, guidance, navi } from '@/state/navi'
import { blank_track, copy_track, round }                   from '@/state/racing'
import { test_track_start, test_track_stop }                from '@/state/track-test'

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
      test_track_start, test_track_stop,
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
      if (new_editing.id) {
        const i = this.track.points.findIndex(p => p.id === new_editing.id)
        if (i >= 0) this.track.points[i] = copy_navi(new_editing)
        if (navi.id === new_editing.id) {
          copy_navi(this.track.points[i], navi)
        }
      } else {
        new_editing.id = point_id(this.track)
        this.track.points.push(copy_navi(new_editing))
      }
      this.is_edit = false
      copy_navi(blank_navi(), this.editing)
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
    },

    track_save () {
      this.save_race()
    },

    track_clear () {
      copy_track(blank_track(), this.track)
    },

    save_race () {
      if (!this.track.uuid) this.track.uuid = uuid()
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
.track {
  &__actions {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-gap: 0.5rem;
    margin: 2rem 0;
  }
  h3 {
    @include typo-caps(400);
    margin: 1rem 0;
  }

  &__curr-point-actions {
    display: flex;
    justify-content: center;

    button {
      margin: 0 0.5rem 0 0;
    }
  }

  &__point {
    margin-bottom: 1rem;

    p {
      border-top: 1px solid orange;
    }

    &-actions {
      display: flex;
      justify-content: center;
      grid-template-columns: repeat(4, minmax(0, 1fr));

      button {
        margin: 0 0.5rem 0 0;
        padding: 0.25rem 1.25rem;
        &.delete {
          margin-right: auto;
        }
      }
    }
  }
}
</style>
