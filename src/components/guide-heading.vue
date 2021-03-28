<template>
  <div class="navigator">
    <div ref="elm" class="compass edfx">
      <div :style="ruler.style_ruler" class="current">
        <b class="head"></b>
      </div>
      <div v-if="guidance.heading" :style="ruler.style_dest" class="dest">
        <b :class="ruler.deviation_stat" class="head">{{ guidance.heading }}</b>
        <div
            v-if="guidance.distance"
            :class="guidance.distance !== null && guidance.distance <= navi.dest.min_dist"
            class="dist"
        >
          <small>DISTANCE:</small> {{ ruler.reach_distance }} KM
        </div>
      </div>
    </div>
    <pre>{{ ruler }}</pre>
  </div>
</template>

<script>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'

import { guidance, navi } from '@/state/navi'
import { status }         from '@/state/status'
import { round_n }        from '@/helpers/formaters'

export default {
  name: 'guidance-heading',
  setup () {
    const ruler = reactive({
      deviation_stat: computed(() => {
        if (guidance.deviation > 150) return 'deviation3'
        if (guidance.deviation > 15) return 'deviation2'
        if (guidance.deviation > 10) return 'deviation1'
        return 'deviation0'
      }),
      ruler_width: 0,
      style_ruler: {
        backgroundPositionX: computed(() => {
          return ((ruler.ruler_width / 2) - status.pos.heading * 4) + 'px'
        }),
      },
      style_dest: {
        backgroundPositionX: computed(() => {
          return (ruler.ruler_width / 2) - ((status.pos.heading - guidance.heading) * 4) + 'px'
        }),
      },
      reach_distance: computed(() => round_n(guidance.distance - navi.dest.min_dist, 100)),
    })

    const elm = ref(null)
    const update_ruler = () => ruler.ruler_width = elm.value.clientWidth

    onMounted(() => {
      window.addEventListener('resize', update_ruler)
      update_ruler()
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', update_ruler)
    })

    return { elm, ruler, navi, guidance, status }
  },

}


</script>

<style lang="scss">
.navigator {
  .compass {
    margin: 0;
    padding: 5px 0;
    max-width: 640px;

    .current {
      position: relative;
      width: 100%;
      height: 42px;
      margin: 0;
      transition: all linear 1s;
      background: transparent url('../assets/nav-ruler.gif') 0 5px repeat-x;
      image-rendering: pixelated;

      .head {
        position: absolute;
        left: 50%;
        display: block;
        width: 0;
        height: 0;
        margin: 0 0 0 -5px;
        border-top: 5px solid #ff8800;
        border-right: 5px solid transparent;
        border-left: 5px solid transparent;
      }
    }

    .dest {
      position: relative;
      width: 100%;
      height: 55px;
      transition: all linear 0.4s;
      background: transparent url('../assets/nav-ruler-dest.gif') 0 0 repeat-x;
      image-rendering: pixelated;

      .head {
        font-size: 18px;
        position: absolute;
        left: 50%;;
        display: block;
        width: 55px;
        margin: 14px 0 0 -25px;
        transition: transform linear 0.4s;
        text-align: center;
        color: #555;
        border-style: solid;
        border-width: 1px;
      }

      .head:after {
        position: absolute;
        top: -14px;
        left: 50%;
        display: block;
        width: 0;
        height: 0;
        margin: 3px 0 0 -8px;
        content: '';

        border-left-color: transparent;
        border-right-color: transparent;
        border-style: none solid solid solid;
        border-width: 0 8px 8px 8px;
      }

      .head:before {
        font-size: 16px;
        position: absolute;
        top: 2em;
        left: 50%;
        display: block;
        width: 200px;
        margin: 0 0 0 -100px;
        content: 'resolving vector...';
        text-align: center;
        text-transform: uppercase;
      }

      .head.deviation0 {
        color: #0098f9;
      }
      .head.deviation0:before {
        content: '[ ok ]';
      }


      .head.deviation1 {
        color: #FF8800;
      }
      .head.deviation1:before {
        content: 'course deviation';
        animation: blinker 500ms infinite;
      }

      .head.deviation2 {
        color: red;
      }
      .head.deviation2:before {
        content: 'wrong course!';
        animation: blinker 400ms infinite;
      }

      .head.deviation3 {
        color: #d900d9;
      }

      .head.deviation3:before {
        content: 'turn back!';
        animation: blinker 300ms infinite;
      }

      .head.err {
        color: red;
      }

      .head.err:before {
        content: 'destination data invalid';
        color: red;
      }

      .dist {
        @include typo-caps(200);

        font-size: 1.4em;
        position: absolute;
        right: 0;
        bottom: 0;
        text-align: right;

        small {
          font-size: 0.6em;
          line-height: 1;
          display: block;
        }
      }
    }
  }

  small {
    color: grey;
  }
}

@keyframes blinker {
  0% {
    opacity: 0;
  }
  30% {
    opacity: 0;
  }
  30.1% {
    opacity: 1;
  }
  100% {
    opacity: 1;
  }
}
</style>
