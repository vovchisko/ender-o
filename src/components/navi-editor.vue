<template>
  <div>
    <button v-for="type in DEST_TYPE"
            :class="{'active': type === new_navi.type}"
            @click="new_navi.type=type">
      {{ type }}
    </button>
  </div>

  <hr />

  <label v-if="can_select.transport"> transport
    <select v-model="new_navi.required.transport">
      <option v-for="type in TRANSPORT_TYPE" :value="type">{{ type }}</option>
    </select>
  </label>

  <label> system <input v-model="new_navi.dest.system" type="text" /> </label>

  <label v-if="can_select.approach"> approach (body or station)
    <input v-model="new_navi.approach" type="text" />
  </label>

  <label v-if="can_select.planet"> planet
    <input v-model="new_navi.dest.planet" type="text" />
  </label>

  <label v-if="can_select.station"> station
    <input v-model="new_navi.dest.docked" type="text" />
  </label>

  <template v-if="can_select.coords">
    <label> lon
      <input v-model="new_navi.dest.lon" type="number" min="-180" max="180" step="any" />
    </label>

    <label> lat
      <input v-model="new_navi.dest.lat" type="number" min="-90" max="90" step="any" />
    </label>

    <label v-if="can_select.altitude"> min alt
      <input v-model="new_navi.dest.alt" type="number" />
    </label>

    <label> min_dist
      <input v-model="new_navi.dest.min_dist" type="number" />
    </label>
  </template>

  <hr>

  <button @click="pick_current">pick current</button>
  <button @click="apply">apply</button>
  <button @click="cancel">cancel</button>

  <hr>

  <pre>{{ can_select }}</pre>
  <pre>{{ new_navi }}</pre>
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
    const new_navi = reactive({
      type: DEST_TYPE.PLANETARY,
      approach: '',
      required: {
        ship_model: '',
        transport: TRANSPORT_TYPE.UNKNOWN,
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
          [ DEST_TYPE.PLANETARY ].includes(new_navi.type)
      )),
      station: computed(() => (
          new_navi.type === DEST_TYPE.DOCK
      )),
      approach: computed(() => (
          [ DEST_TYPE.APPROACH, DEST_TYPE.DOCK ].includes(new_navi.type)
      )),
      transport: computed(() => (
          new_navi.type === DEST_TYPE.PLANETARY
      )),
      coords: computed(() => (
          new_navi.type === DEST_TYPE.PLANETARY
      )),
      altitude: computed(() => (
          new_navi.type === DEST_TYPE.PLANETARY &&
          [
            TRANSPORT_TYPE.SHIP,
            TRANSPORT_TYPE.FIGHTER,
          ].includes(new_navi.required.transport)
      )),
    })

    new_navi.type = navi.type
    new_navi.approach = navi.approach
    Object.assign(new_navi.required, navi.required)
    Object.assign(new_navi.dest, navi.dest)

    return { can_select, new_navi, navi, DEST_TYPE, TRANSPORT_TYPE }
  },
  emits: [ 'apply', 'cancel' ],
  methods: {
    cancel () {
      this.$emit('cancel')
    },

    apply () {
      const n = this.new_navi

      const to_event = {
        type: n.type,
        approach: '',
        required: {
          ship_model: '', // will use it in future
          transport: TRANSPORT_TYPE.UNKNOWN,
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

      to_event.dest.system = extract.stellar_name(n.dest.system)

      if (this.can_select.transport) {
        to_event.required.transport = n.required.transport
      }

      if (this.can_select.approach) {
        to_event.approach = extract.stellar_name(n.approach)
      }

      if (this.can_select.station) {
        to_event.dest.docked = extract.stellar_name(n.dest.docked)
      }

      if (this.can_select.planet) {
        to_event.dest.planet = extract.stellar_name(n.dest.planet)
      }

      if (this.can_select.coords) {
        to_event.dest.lat = minmax(n.dest.lat, -90, 90)
        to_event.dest.lon = minmax(n.dest.lon, -180, 180)
        to_event.dest.min_dist = minmax(n.dest.min_dist, 200, 5000)

        if (this.can_select.altitude) {
          to_event.dest.alt = minmax(n.dest.alt, 0, Infinity)
        }
      }

      this.$emit('apply', to_event)
    },

    pick_current () {
      const n = this.new_navi

      console.log(status.pos.alt)

      if (status.docked.name && status.docked.type) {
        n.type = DEST_TYPE.DOCK
      } else if (status.pos.alt !== null) {
        n.type = DEST_TYPE.PLANETARY
      } else if (status.near.body) {
        n.type = DEST_TYPE.APPROACH
      } else {
        n.type = DEST_TYPE.SYSTEM
      }

      n.approach = status.near.body
      n.required.transport = status.transport
      n.dest.system = status.pos.system
      n.dest.planet = status.pos.planet
      n.dest.docked = status.docked.name
      n.dest.lat = status.pos.lat
      n.dest.lon = status.pos.lon
      n.dest.alt = status.pos.alt
      n.dest.min_dist = 1000
    },
  },
}
</script>

<style lang="scss" scoped>

</style>
