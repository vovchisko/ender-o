<template>
  <div class="navi-edit">
    <div class="tabs" v-if="show_edit">
      <p>type:</p>
      <button v-for="type in DEST_TYPE"
              :class="{'active': type === form.type}"
              @click="form.type=type">
        {{ type }}
      </button>
    </div>

    <div class="form" v-if="show_edit">
      <p>destination criterias:
        <button @click="pick_current">pick current</button>
      </p>
      <div class="fields">
        <div v-if="can_select.transport" class="field field-transport">
          <label>required transport</label>
          <button v-for="type in TRANSPORT_TYPE"
                  :value="type"
                  @click="form.required.transport = type"
                  :class="{'active': form.required.transport === type }"
          >
            {{ type }}
          </button>
        </div>
        <label class="field"> target system
          <input v-model="form.dest.system" type="text" />
        </label>
        <label class="field" v-if="can_select.approach"> approach (body or station)
          <input v-model="form.approach" type="text" />
        </label>
        <label class="field" v-if="can_select.planet"> landable planet
          <input v-model="form.dest.planet" type="text" />
        </label>
        <label class="field" v-if="can_select.station"> station to dock
          <input v-model="form.dest.docked" type="text" />
        </label>
        <template v-if="can_select.coords">
          <label class="field"> lon
            <input v-model="form.dest.lon"
                   type="number"
                   min="-180"
                   max="180"
                   step="any" />
          </label>
          <label class="field"> lat
            <input v-model="form.dest.lat" type="number" min="-90" max="90" step="any" />
          </label>
          <label class="field" v-if="can_select.altitude"> min altitude (meters)
            <input v-model="form.dest.alt" type="number" />
          </label>
          <label class="field"> point radius (meters)
            <input v-model="form.dest.min_dist" type="number" />
          </label>
        </template>
      </div>
    </div>
    <div class="btns" :class="{'expanded': show_edit}">
      <template v-if="show_edit">
        <button @click="apply">apply</button>
        <button @click="cancel">cancel</button>
      </template>
      <button @click="edit" v-if="!show_edit">edit navigation point</button>
    </div>
  </div>

</template>

<script>
import { DEST_TYPE, navi }         from '@/state/navi'
import { status, TRANSPORT_TYPE }  from '@/state/status'
import { computed, reactive, ref } from 'vue'
import { extract }                 from '@/helpers/journal_api'
import { minmax }                  from '@/helpers/formaters'

export default {
  name: 'navi-editor',
  setup () {
    const show_edit = ref(false)
    const form = reactive({
      type: DEST_TYPE.PLANETARY,
      approach: '',
      required: {
        ship_model: '',
        transport: TRANSPORT_TYPE.SHIP,
      },
      dest: {
        system: '',
        planet: '',
        docked: '',
        lon: 0,
        lat: 0,
        alt: 0,
        min_dist: 0,
      },
    })

    const can_select = ref({
      planet: computed(() => (
          [ DEST_TYPE.PLANETARY ].includes(form.type)
      )),
      station: computed(() => (
          form.type === DEST_TYPE.DOCK
      )),
      approach: computed(() => (
          [ DEST_TYPE.APPROACH, DEST_TYPE.DOCK ].includes(form.type)
      )),
      transport: computed(() => (
          form.type === DEST_TYPE.PLANETARY
      )),
      coords: computed(() => (
          form.type === DEST_TYPE.PLANETARY
      )),
      altitude: computed(() => (
          form.type === DEST_TYPE.PLANETARY &&
          [
            TRANSPORT_TYPE.SHIP,
            TRANSPORT_TYPE.FIGHTER,
          ].includes(form.required.transport)
      )),
    })

    form.type = navi.type
    form.approach = navi.approach
    Object.assign(form.required, navi.required)
    Object.assign(form.dest, navi.dest)

    return {
      can_select, form, show_edit,
      navi, DEST_TYPE, TRANSPORT_TYPE,
    }
  },
  emits: [ 'apply', 'cancel' ],
  methods: {
    edit () {
      this.pick_current()
      this.show_edit = true
    },

    cancel () {
      this.show_edit = false

      this.form.type = DEST_TYPE.PLANETARY
      this.form.approach = ''
      this.form.required.transport = TRANSPORT_TYPE.SHIP
      this.form.dest.system = ''
      this.form.dest.planet = ''
      this.form.dest.docked = ''
      this.form.dest.lat = 0
      this.form.dest.lon = 0
      this.form.dest.alt = 0
      this.form.dest.min_dist = 1000
    },

    apply () {
      const to_event = {
        type: this.form.type,
        approach: '',
        required: {
          ship_model: '', // will use it in future
          transport: TRANSPORT_TYPE.SHIP,
        },
        dest: {
          system: '',
          planet: '',
          docked: '',
          lon: 0,
          lat: 0,
          alt: 0,
          min_dist: 0,
        },
      }

      to_event.dest.system = extract.stellar_name(this.form.dest.system)

      if (this.can_select.transport) {
        to_event.required.transport = this.form.required.transport
      }

      if (this.can_select.approach) {
        to_event.approach = extract.stellar_name(this.form.approach)
      }

      if (this.can_select.station) {
        to_event.dest.docked = extract.stellar_name(this.form.dest.docked)
      }

      if (this.can_select.planet) {
        to_event.dest.planet = extract.stellar_name(this.form.dest.planet)
      }

      if (this.can_select.coords) {
        to_event.dest.lat = minmax(this.form.dest.lat, -90, 90)
        to_event.dest.lon = minmax(this.form.dest.lon, -180, 180)
        to_event.dest.min_dist = minmax(this.form.dest.min_dist, 200, 5000)

        if (this.can_select.altitude) {
          to_event.dest.alt = minmax(this.form.dest.alt, 0, Infinity)
        }
      }

      this.$emit('apply', to_event)

      this.show_edit = false
    },

    pick_current () {
      if (status.docked.name && status.docked.type) {
        this.form.type = DEST_TYPE.DOCK
      } else if (status.pos.alt !== null) {
        this.form.type = DEST_TYPE.PLANETARY
      } else if (status.near.body) {
        this.form.type = DEST_TYPE.APPROACH
      } else {
        this.form.type = DEST_TYPE.SYSTEM
      }

      this.form.approach = status.near.body
      this.form.required.transport = status.transport
      this.form.dest.system = status.pos.system
      this.form.dest.planet = status.pos.planet
      this.form.dest.docked = status.docked.name
      this.form.dest.lat = status.pos.lat
      this.form.dest.lon = status.pos.lon
      this.form.dest.alt = status.pos.alt
      this.form.dest.min_dist = 1000
    },
  },
}
</script>

<style lang="scss" scoped>
.navi-edit {
  display: flex;
  align-content: flex-start;

  p {
    @include typo-caps();
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 2.5rem;
  }

  .tabs {
    grid-template-columns: repeat(5, minmax(0, 1fr));

    & button {
      display: block;
      border: 0 none;
      text-align: right;
      width: 10rem;
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
    flex: 1;

    .fields {
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
              border-color: #ff8800ff
            }
          }
        }
      }
    }
  }

  .btns.expanded {
    margin-top: 0;
    display: flex;
    flex-direction: column;

    & button {
      width: 10rem;
      margin-bottom: 1rem;
    }
  }
}


</style>
