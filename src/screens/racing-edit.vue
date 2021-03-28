<template>
  <div class="cols">
    <div class="col">
      <div class="block">
        <b class="caps">CURRENT POINT</b>
        <pre>{{ guidance }}</pre>
      </div>
      <div class="block">
        <b class="caps">DESTINATION</b>

        <button @click="clear_destination">CLEAR</button>

        <template v-if="!show_edit">
          <button @click="show_edit = true">EDIT</button>
          <pre>{{ navi }}</pre>
        </template>
        <dest-editor
            v-else
            @apply="apply_destination"
            @cancel="show_edit = false"
        />
      </div>
    </div>

    <div class="col wide">
      <guidance-bar></guidance-bar>
    </div>

    <div class="col">
      <div class="block">
        <b class="caps">COMPUETD STATUS</b>
        <pre>{{ status }}</pre>
      </div>
    </div>


  </div>
</template>

<script>
import { status }                     from '@/state/status'
import { guidance, navi, navi_reset } from '@/state/navi'
import DestEditor                     from '@/components/guide-editor'
import GuidanceBar                    from '@/components/guide-heading'
import { ref }                        from 'vue'

export default {
  name: 'racing-edit',
  components: { GuidanceBar, DestEditor },
  setup () {
    const show_edit = ref(false)

    return {
      show_edit,
      status, guidance, navi,
    }
  },
  methods: {
    apply_destination (new_navi) {
      navi.is_set = true
      navi.type = new_navi.type
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
.cols {
  display: flex;

  justify-content: space-between;
  max-height: 100%;
  color: orange;

  .guidance-heading {
    max-width: 700px;
    margin: 0 auto;
  }

  .col {
    display: flex;
    flex: 1;
    flex-direction: column;
    max-height: 100%;

    &.wide {
      flex: 2
    }

    .block {
      @include scrollbar-awesome();

      overflow: auto;
      min-height: 15%;
      margin: 1rem;

      b {
        font-size: 1.2rem;
      }


      .rec:hover {
        color: #ffba52;
      }

      .rec.expanded {
        color: #ffdaa3 !important;
      }

      pre {
        line-height: 1;
        margin: 0;
        padding: 0.2rem;
      }
    }
  }
}
</style>
