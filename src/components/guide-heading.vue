<template>
  <div ref="elm" class="guide-heading">
    <div :style="ruler.style_ruler" class="current">
      <b class="head"></b>
    </div>
    <div v-if="guidance.is_head_active" :style="ruler.style_dest" class="dest">
      <div :class="ruler.deviation_stat" class="head">{{ guidance.heading }}</div>

      <div class="telemetry">
        <div class="distance"
             :class="guidance.reach_distance <= 0 ? 'on-position' : ''"
        >
          <small class="lbl">DISTANCE:</small>
          <span class="val">
              <template v-if="guidance.reach_distance <= 0">
                ON POSITION
              </template>
              <template v-if="guidance.reach_distance > 0">
                {{ ruler.distance.toLocaleString() }} KM
              </template>
            </span>
          <b class="sig" />
        </div>

        <div v-if="ruler.altitude_stat" class="altitude" :class="ruler.altitude_stat">
          <small class="lbl">MIN. ALT:</small>
          <b class="sig" />
          <span class="val">{{ navi.dest.alt.toLocaleString() }} M</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'

import { round_n }        from '@/helpers/formaters'
import { guidance, navi } from '@/state/navi'
import { status }         from '@/state/status'

export default {
  name: 'guide-heading',
  setup () {
    const ruler = reactive({
      distance: computed(() => {
        return guidance.reach_distance !== null
            ? round_n(guidance.reach_distance / 1000, 1000, 3)
            : null
      }),
      altitude_stat: computed(() => {
        if (!navi.dest.alt) return ''
        if (status.pos.alt > navi.dest.alt) return 'err'
        if (status.pos.alt < navi.dest.alt / 2) return 'perfect'
        return 'ok'
      }),
      deviation_stat: computed(() => {
        if (guidance.reach_distance < 0) return 'on-position'
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

    return { elm, ruler, guidance, navi, status }
  },

}


</script>

<style lang="scss">
.guide-heading {
  margin: 0 auto;
  padding: 0.5em 0;
  color: #ff8800;

  .current {
    position: relative;
    width: 100%;
    height: 42px;
    margin: 0;
    transition: all linear 0.5s;
    background: transparent url('../assets/nav-ruler.gif') 0 5px repeat-x;
    image-rendering: pixelated;

    .head {
      position: absolute;
      left: 50%;
      display: block;
      width: 0;
      height: 0;
      margin: 0 0 0 -7px;
      border-top: 7px solid #ff8800;
      border-right: 7px solid transparent;
      border-left: 7px solid transparent;
    }
  }

  .dest {
    position: relative;
    width: 100%;
    height: 55px;
    transition: all linear 0.5s;
    background: transparent url('../assets/nav-ruler-dest.gif') 0 0 repeat-x;
    image-rendering: pixelated;

    .head {
      @include typo-caps(400);

      font-weight: bold;
      position: absolute;
      left: 50%;;
      display: block;
      width: 64px;
      margin: 12px 0 0 -32px;
      text-align: center;
      color: #555;
      border-style: solid;
      border-width: 1px;
      top: -2px;

      &::after {
        position: absolute;
        top: -12px;
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

      &:before {
        position: absolute;
        top: 23px;
        left: 50%;
        display: block;
        width: 200px;
        margin: 0 0 0 -100px;
        content: 'resolving vector...';
        text-align: center;
      }

      &.on-position {
        color: #2ebf1e;
        &:before {
          content: 'in position';
        }
      }

      &.deviation0 {
        color: #0098f9;
        &:before {
          content: 'correct';
        }
      }

      &.deviation1 {
        color: #FF8800;
        &:after {
          animation: blinker 500ms infinite;
        }
        &:before {
          content: 'course deviation';
        }
      }

      &.deviation2 {
        color: red;
        &:before {
          content: 'wrong course!';
          animation: blinker 400ms infinite;
        }
      }

      &.deviation3 {
        color: #d900d9;
        animation: blinker 400ms infinite;
        &:before {
          content: 'turn back!';
        }
      }


      &.err {
        color: red;
        &:before {
          content: 'destination data invalid';
          color: red;
        }
      }
    }

    .telemetry {
      @include typo-caps(400);

      position: absolute;
      right: 0;
      left: 0;
      bottom: 0;
      font-weight: bold;
      min-width: 30%;
      display: flex;
      justify-content: space-between;

      .lbl {
        @include typo-caps(100);

        margin-top: 0.5em;
        line-height: 0.6em;
        display: block;
      }

      .sig {
        padding: 0 0.5em;
      }

      .distance {
        text-align: left;
        &.on-position .val {
          color: #0098f9;
        }
      }

      .altitude {
        text-align: right;
        &.perfect {
          & .sig:before {
            color: #00ffa6;
            content: 'pefrect';
          }
        }

        &.ok {
          & .val {
            opacity: 0.75;
          }
          & .sig:before {
            color: #0098f9;
            content: 'ok'
          }
        }
        &.err {
          & .sig:before {
            color: red;
            content: '[ pull down ]';
            animation: blinker 400ms infinite;
          }
        }
      }
    }
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
