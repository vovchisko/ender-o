<template>
  <button v-for="type in DEST_TYPE"
          :class="{'active': type === new_navi.type}"
          @click="new_navi.type=type">
    {{ type }}
  </button>

  <template>
    <label> transport
      <select v-model="new_navi.required.transport">
        <option v-for="type in TRANSPORT_TYPE" :value="type">{{ type }}</option>
      </select>
    </label>
  </template>

  <label> system <input v-model="new_navi.dest.system" type="text" /> </label>
  <label> planet <input v-model="new_navi.dest.planet" type="text" /> </label>
  <label> dock <input v-model="new_navi.dest.docked" type="text" /> </label>

  <template v-if="new_navi.type=DEST_TYPE.PLANETARY">
    <label> lon <input v-model="new_navi.dest.lon"
                       type="number"
                       min="-180"
                       max="180"
                       step="any" /> </label>
    <label> lat <input v-model="new_navi.dest.lat"
                       type="number"
                       min="-90"
                       max="90"
                       step="any" /> </label>
    <label> alt <input v-model="new_navi.dest.alt" type="number" /> </label>
    <label> min_dist <input v-model="new_navi.dest.min_dist" type="number" /> </label>
  </template>

  <hr>
  <button @click="pick_current">pick current</button>


  <button @click="apply">apply</button>
  <button @click="cancel">cancel</button>

  <hr>
  <pre>{{ new_navi }}</pre>
</template>

<script>
import { DEST_TYPE, navi }        from '@/state/navi'
import { status, TRANSPORT_TYPE } from '@/state/status'
import { reactive }               from 'vue'
import { extract }                from '@/helpers/journal_api'
import { minmax }                 from '@/helpers/formaters'

export default {
  name: 'dest-editor',
  setup () {
    const new_navi = reactive({
      type: DEST_TYPE.PLANETARY,
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

    new_navi.type = navi.type
    Object.assign(new_navi.required, navi.required)
    Object.assign(new_navi.dest, navi.dest)

    return { new_navi, navi, DEST_TYPE, TRANSPORT_TYPE }
  },
  emits: [ 'apply', 'cancel' ],
  methods: {
    cancel () {
      this.$emit('cancel')
    },

    apply () {
      this.new_navi.dest.system = extract.stellar_name(this.new_navi.dest.system)
      this.new_navi.dest.planet = extract.stellar_name(this.new_navi.dest.planet)
      this.new_navi.dest.docked = extract.stellar_name(this.new_navi.dest.docked)

      this.new_navi.dest.alt = minmax(this.new_navi.dest.alt, 0, Infinity)
      this.new_navi.dest.lat = minmax(this.new_navi.dest.lat, -90, 90)
      this.new_navi.dest.lon = minmax(this.new_navi.dest.lon, -180, 180)

      this.$emit('apply', this.new_navi)
    },

    pick_current () {
      this.new_navi.required.transport = status.transport
      this.new_navi.dest.system = status.pos.system
      this.new_navi.dest.planet = status.pos.planet
      this.new_navi.dest.docked = status.docked.name
      this.new_navi.dest.lat = status.pos.lat
      this.new_navi.dest.lon = status.pos.lon
      this.new_navi.dest.alt = status.pos.alt
      this.new_navi.dest.min_dist = 1000
    },
  },
}
</script>

<style lang="scss" scoped>

</style>
