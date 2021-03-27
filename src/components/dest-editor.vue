<template>
  <div class="cols">
    <div class="col ">
      <label>dest type
        <select v-model="new_navi.type">
          <option v-for="type in DEST_TYPE" :value="type">{{ type }}</option>
        </select>
      </label>
      <label>transport
        <select v-model="new_navi.required.transport">
          <option v-for="type in TRANSPORT_TYPE" :value="type">{{ type }}</option>
        </select>
      </label>

      <label> system <input type="text" v-model="new_navi.dest.system" /> </label>
      <label> planet <input type="text" v-model="new_navi.dest.planet" /> </label>
      <label> dock <input type="text" v-model="new_navi.dest.docked" /> </label>

      <label> lon <input type="number" v-model="new_navi.dest.lon" /> </label>
      <label> lat <input type="number" v-model="new_navi.dest.lat" /> </label>
      <label> alt <input type="number" v-model="new_navi.dest.alt" /> </label>
      <label> min_dist <input type="number" v-model="new_navi.dest.min_dist" /> </label>

      <button @click="cancel">cancel</button>
      <button @click="apply">apply</button>
      <button @click="pick_current">pick current</button>
    </div>
  </div>
</template>

<script>
import { guidance, DEST_TYPE, navi } from '@/state/navi'
import { status, TRANSPORT_TYPE }     from '@/state/status'
import { reactive }                   from 'vue'

export default {
  name: 'dest-editor',
  setup () {
    const new_navi = reactive({
      type: DEST_TYPE.PLANETARY, // keep it unset and required
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
    return { new_navi, guidance, navi, DEST_TYPE, TRANSPORT_TYPE }
  },
  methods: {
    cancel () {
      this.new_navi.type = navi.type
      Object.assign(this.new_navi.dest, navi.dest)
      Object.assign(this.new_navi.required, navi.required)
    },
    apply () {
      navi.type = this.new_navi.type
      Object.assign(navi.dest, this.new_navi.dest)
      Object.assign(navi.required, this.new_navi.required)
      navi.is_set = true
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

<style scoped lang="scss">
.cols {
  display: flex;

  .col {}
}

.grid3 {
  display: grid;
  grid-gap: 1rem;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: min-content;
}

label {
  margin-bottom: 14px;
}

button, label, select, input {
  display: block;
  width: 100%;
}
</style>
