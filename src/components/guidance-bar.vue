<template>
  <div class="navigator">
    <div class="compass edfx" ref="ruler_elm">
      <div class="current" :style="ruler.style_ruler">
        <b class="head"></b>
      </div>
      <div class="dest" v-if="guidance.heading" :style="ruler.style_dest">
        <b class="head" :class="ruler.deviation_stat">{{ guidance.heading }}</b>
        <div
            class="dist"
            v-if="guidance.distance"
            :class="guidance.distance !== null && guidance.distance <= navi.dest.min_dist"
        >
          <small>DISTANCE:</small>
          {{ guidance.distance }} KM
          <small v-if="navi.dest.min_dist">check: {{ navi.dest.min_dist }} KM</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { guidance, navi }     from '@/state/navi'
import { status }             from '@/state/status'
import { computed, reactive } from 'vue'

export default {
  name: 'guidance-bar',
  setup () {
    const ruler = reactive({
      deviation_stat: computed(() => {
        if (guidance.deviation > 50) return 'deviation3'
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
    })
    return { ruler, navi, guidance, status }
  },

  mounted () {
    this.$nextTick(() => {
      this.ruler.ruler_width = this.$refs.ruler_elm.clientWidth
    })
  },
}


</script>

<style lang="scss">
.navigator {
  .compass {
    margin: 0;
    padding: 5px 0;

    .current {
      image-rendering: pixelated;
      position: relative;
      background: transparent url('../assets/nav-ruler.gif') 0 5px repeat-x;
      width: 100%;
      height: 42px;
      margin: 0;
      transition: all linear 1s;

      .head {
        position: absolute;
        left: 50%;
        margin: 0 0 0 -5px;
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 5px solid #ff8800;
        display: block;
      }
    }

    .dest {
      image-rendering: pixelated;
      background: transparent url('../assets/nav-ruler-dest.gif') 0 0 repeat-x;
      width: 100%;
      height: 55px;
      position: relative;
      transition: all linear 0.4s;

      .head {
        transition: transform linear 0.4s;
        width: 55px;
        font-size: 18px;
        display: block;
        text-align: center;
        border: 1px solid #555;
        color: #555;
        position: absolute;
        left: 50%;;
        margin: 14px 0 0 -25px;
      }

      .head:after {
        content: '';
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-bottom: 8px solid #555;
        display: block;
        position: absolute;
        left: 50%;
        margin: 3px 0 0 -8px;
        top: -14px;
      }

      .head:before {
        content: 'vector';
        color: #676767;
        display: block;
        position: absolute;
        left: 50%;
        margin: 0 0 0 -100px;
        top: 21px;
        width: 200px;
        text-align: center;
        text-transform: uppercase;
        font-size: 15px;
      }

      .head.deviation0 {
        border-color: #0098f9;
        color: #0098f9;
      }

      .head.deviation0:after {
        border-bottom-color: #0098f9;
        top: -14px;
      }

      .head.deviation0:before {
        content: '[ ok ]';
        color: #0098f9;
      }

      .head.deviation1 {
        border-color: #FF8800;
        color: #FF8800;
      }

      .head.deviation1:after {
        border-bottom-color: #FF8800;
        top: -14px;
      }

      .head.deviation1:before {
        content: 'misaligned';
        color: #FF8800;
      }

      .head.deviation2 {
        border-color: red;
        color: red;
      }

      .head.deviation2:after {
        border-bottom-color: red;
        top: -14px;
      }

      .head.deviation2:before {
        content: 'wrong vector!';
        color: red;
      }

      .head.err {
        animation: glitched_text 2.5s infinite;
        color: red;
        border-color: red;
      }

      .head.err:after {
        border-bottom-color: red;
      }

      .head.err:before {
        content: 'destination data invalid';
        color: red
      }

      .dist {
        @include typo-caps(200);

        position: absolute;
        right: 0;
        bottom: 0;
        font-size: 1.4em;
        text-align: right;

        small {
          display: block;
          font-size: 0.6em;
          line-height: 1
        }

      }
    }
  }

  small {
    color: grey;
  }
}
</style>
