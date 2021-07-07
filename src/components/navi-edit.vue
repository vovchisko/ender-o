<template>
  <!-- todo: track save status and block buttons user can't click -->

  <p class="title">{{ editing.id ? `edit point: ${ editing.type }` : 'new point' }}</p>
  <div class="navi-edit">
    <div class="tabs">
      <div class="col-title">
        <p>type:</p>
      </div>
      <button v-for="type in DEST_TYPE"
              :class="{ active: type === editing.type}"
              @click="editing.type=type">
        {{ type }}
      </button>
    </div>

    <div class="form">
      <div class="col-title">
        <p>destination criterias:</p>
        <button @click="pick_from_position()">right here</button>
        <button @click="pick_from_navi()" v-if="guidance">from destination</button>
      </div>
      <div class="fields">
        <div v-if="can_select.transport" class="field field-transport">
          <label>required transport</label>
          <button v-for="type in TRANSPORT_TYPE"
                  :value="type"
                  :class="{ active: editing.required.transport === type }"
                  @click="editing.required.transport = type"
          >
            {{ type }}
          </button>
        </div>
        <div class="cols">
          <div class="col">
            <label class="field"> target system
              <input v-model="editing.dest.system" type="text" />
            </label>
            <label class="field" v-if="can_select.approach"> approach (body or station)
              <input v-model="editing.approach" type="text" />
            </label>
            <label class="field" v-if="can_select.planet"> landable planet
              <input v-model="editing.dest.planet" type="text" />
            </label>
            <label class="field" v-if="can_select.station"> station to dock
              <input v-model="editing.dest.docked" type="text" />
            </label>
            <label class="field"> label
              <input v-model="editing.label" type="text" />
            </label>
          </div>
          <div class="col">
            <template v-if="can_select.coords">
              <label class="field"> lon
                <input v-model="editing.dest.lon"
                       type="number"
                       min="-180"
                       max="180"
                       step="any" />
              </label>
              <label class="field"> lat
                <input v-model="editing.dest.lat"
                       type="number"
                       min="-90"
                       max="90"
                       step="any" />
              </label>
              <label class="field" v-if="can_select.altitude"> max altitude (meters)
                <input v-model="editing.dest.alt" type="number" />
              </label>
              <label class="field"> point radius (meters)
                <input v-model="editing.dest.min_dist" type="number" />
              </label>
            </template>
            <label class="field" v-if="can_select.supercruise"> supercruise<br>
              <button :class="{active:editing.supercruise === true}" @click="editing.supercruise = true">yes</button>
              <button :class="{active:editing.supercruise === null}" @click="editing.supercruise = null">ignore</button>
              <button :class="{active:editing.supercruise === false}" @click="editing.supercruise = false">no</button>
              <span class="warn" v-if="editing.supercruise !== null && editing.type === DEST_TYPE.PLANETARY">
                make sure your checkpoint radius is large enough to prevent overshoot.
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <div class="btns">
      <button @click="apply()">
        {{ editing.id ? 'save' : 'create' }} point
      </button>
      <button @click="cancel()">cancel</button>
    </div>
  </div>
  <pre>{{ can_select }}</pre>
</template>

<script>
import { computed, ref } from 'vue'

import { blank_navi, copy_navi, DEST_TYPE, guidance, navi } from '@/state/navi'
import { status, TRANSPORT_TYPE }                           from '@/state/status'
import { extract }                                          from '@/helpers/journal_api'
import { minmax }                                           from '@/helpers/formaters'

export default {
  name: 'navi-edit',
  emits: [ 'apply', 'cancel', 'clear' ],
  props: { editing: { type: Object, required: true } },
  setup ({ editing }) {

    const can_select = ref({
      planet: computed(() => (
          [ DEST_TYPE.PLANETARY ].includes(editing.type)
      )),
      station: computed(() => (
          editing.type === DEST_TYPE.DOCK
      )),
      approach: computed(() => (
          [ DEST_TYPE.APPROACH, DEST_TYPE.DOCK ].includes(editing.type)
      )),
      supercruise: computed(() => (
          (editing.type === DEST_TYPE.PLANETARY && editing.required.transport === TRANSPORT_TYPE.SHIP) ||
          editing.type === DEST_TYPE.SYSTEM
      )),
      transport: computed(() => (
          editing.type === DEST_TYPE.PLANETARY
      )),
      coords: computed(() => (
          editing.type === DEST_TYPE.PLANETARY
      )),
      altitude: computed(() => (
          editing.type === DEST_TYPE.PLANETARY &&
          [
            TRANSPORT_TYPE.SHIP,
            TRANSPORT_TYPE.FIGHTER,
          ].includes(editing.required.transport)
      )),
    })

    return {
      can_select, editing,
      DEST_TYPE, TRANSPORT_TYPE,
      navi, guidance,
    }
  },
  methods: {
    cancel () {
      this.$emit('cancel')
    },
    clear () {
      this.$emit('clear')
    },
    apply () {
      const to_event = blank_navi()

      to_event.label = this.editing.label.toLowerCase()
      to_event.id = this.editing.id
      to_event.type = this.editing.type

      to_event.dest.system = extract.stellar_name(this.editing.dest.system)

      if (this.can_select.transport) {
        to_event.required.transport = this.editing.required.transport
      }

      if (this.can_select.approach) {
        to_event.approach = extract.stellar_name(this.editing.approach)
      }

      if (this.can_select.station) {
        to_event.dest.docked = extract.stellar_name(this.editing.dest.docked)
      }

      if (this.can_select.planet) {
        to_event.dest.planet = extract.stellar_name(this.editing.dest.planet)
      }

      if (this.can_select.coords) {
        to_event.dest.lat = minmax(this.editing.dest.lat, -90, 90)
        to_event.dest.lon = minmax(this.editing.dest.lon, -180, 180)
        to_event.dest.min_dist = minmax(this.editing.dest.min_dist, 50, 5000)

        if (this.can_select.altitude) {
          to_event.dest.alt = minmax(this.editing.dest.alt, 0, Infinity)
        }
      }

      if (this.can_select.supercruise) {
        to_event.supercruise = this.editing.supercruise
        to_event.dest.min_dist = minmax(this.editing.dest.min_dist, 5000, 800000)
      }

      this.$emit('apply', to_event)
    },

    pick_from_position () {
      if (status.docked.name && status.docked.type) {
        this.editing.type = DEST_TYPE.DOCK
      } else if (status.pos.alt !== null) {
        this.editing.type = DEST_TYPE.PLANETARY
      } else if (status.near.body) {
        this.editing.type = DEST_TYPE.APPROACH
      } else {
        this.editing.type = DEST_TYPE.SYSTEM
      }

      this.editing.supercruise = null // don't use it by default, status.flags.Supercruise || null
      this.editing.approach = status.near.body
      this.editing.required.transport = status.transport
      this.editing.dest.system = status.pos.system
      this.editing.dest.planet = status.pos.planet
      this.editing.dest.docked = status.docked.name
      this.editing.dest.lat = status.pos.lat
      this.editing.dest.lon = status.pos.lon

      if (this.editing.required.transport === TRANSPORT_TYPE.FIGHTER) {
        this.editing.dest.min_dist = 1000
        this.editing.dest.alt = status.pos.alt + 100
      } else if (this.editing.required.transport === TRANSPORT_TYPE.SRV) {
        this.editing.dest.min_dist = 50
        this.editing.dest.alt = 0
      } else {
        this.editing.dest.min_dist = 1500
        this.editing.dest.alt = status.pos.alt + 100
      }
    },

    pick_from_navi () {
      copy_navi(navi, this.editing, true)
    },
  },
}
</script>

<style lang="scss" scoped>
.title {
  @include typo-caps(300);
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 128, 0, 0.1);
  margin-bottom: 1rem;
}

.navi-edit {
  display: grid;
  align-content: flex-start;
  grid-template-columns: 1.25fr 4fr 1.25fr;

  .col-title {
    @include typo-caps();
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 2.5rem;

    p {
      margin-right: auto;
    }

    button {
      margin-left: 0.5em;
    }
  }

  .tabs {
    & button {
      display: block;
      border: 0 none;
      text-align: right;
      width: 100%;
    }

    & button:after {
      content: '';
      height: 0.5rem;
      width: 0.5rem;
      display: inline-block;
      margin-left: 0.5rem;
      border-radius: 0.5rem;
      border: 1px solid #ff880055
    }

    & button.active:after {
      background: #ff8800;
      border-color: #ff8800ff
    }
  }

  .form {
    padding: 0 1rem;
    border-right: 1px solid var(--pal-orange);
    border-left: 1px solid var(--pal-orange);
    margin: 0 1rem 0 0;

    .fields {
      .cols {
        display: flex;
        .col {
          flex: 1;
        }
      }
      .field {
        margin-bottom: 1rem;
        display: block;

        &-transport {
          label {
            @include typo-caps();
            display: block;
          }

          button {
            margin-right: 0.25em;
            &:before {
              content: '';
              height: 0.5rem;
              width: 0.5rem;
              display: inline-block;
              margin-right: 0.5rem;
              border-radius: 0.5rem;
              border: 1px solid #ff880055;
            }

            &.active:before {
              background: #ff8800;
              border-color: #ff8800ff;
            }
          }
        }
      }
    }
  }

  .btns {
    margin-top: 0;
    display: flex;
    flex-direction: column;

    & button {
      margin-bottom: 1rem;
    }
  }
}


</style>
