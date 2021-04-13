<template>

  <div class="panel pan--heading-message" v-if="guidance.is_active && label">
    <div class="navi-label">{{ label }}</div>
  </div>

  <div class="panel pan--central-hero-sub ">
    <p class="countdown" v-if="round.state === ROUND_STATES.COUNTDOWN">00 : {{ cdowdn.s }} . {{ cdowdn.ms }}</p>
  </div>

  <transition name="hero-slide">
    <div class="panel pan--central-hero-message" v-if="hero_label.show">
      <p class="hero-message">{{ hero_label.text }}</p>
    </div>
  </transition>

  <div class="panel pan--heading-objectives">

    <div class="header" :class="{ 'complete': guidance.is_complete }">
      guidance:
      <span class="status">
      {{ guidance.is_complete ? 'obj. complete' : 'active' }}
    </span>
      <span class="label">
     {{ navi.type }} {{ navi.id ? `point #${ navi.id }` : '' }}
    </span>
    </div>
    <div class="objectives" :class="{ 'show-all': ui.is_interact }">
      <div class="goal"
           :class="{
           'missing': guidance.objectives.system === false,
           'check': guidance.objectives.system === true
         }">
        <div class="type"><b /> reach system</div>
        <div class="value">{{ navi.dest.system || ph }}</div>
      </div>

      <div class="goal"
           :class="{
            'missing': guidance.objectives.approach === false,
            'check': guidance.objectives.approach === true
          }">
        <div class="type"><b /> approach</div>
        <div class="value">{{ navi.approach || ph }}</div>
      </div>

      <div class="goal"
           :class="{
            'missing': guidance.objectives.planet === false,
            'check': guidance.objectives.planet === true
          }">
        <div class="type"><b /> planet</div>
        <div class="value">{{ navi.dest.planet || ph }}</div>
      </div>

      <div class="goal"
           :class="{
            'missing': guidance.objectives.docked === false,
            'check': guidance.objectives.docked === true
          }">
        <div class="type"><b /> dock on</div>
        <div class="value">{{ navi.dest.docked || ph }}</div>
      </div>

      <div class="goal"
           :class="{
            'missing': guidance.objectives.transport === false,
            'check': guidance.objectives.transport === true
          }">
        <div class="type"><b /> transport type</div>
        <div class="value">{{ navi.required.transport || ph }}</div>
      </div>

      <div class="goal"
           :class="{
            'missing': guidance.objectives.supercruise === false,
            'check': guidance.objectives.supercruise === true
          }">
        <div class="type"><b /> fsd</div>
        <div class="value">
          <template v-if="guidance.objectives.supercruise === null">{{ ph }}</template>
          <template v-else>{{ navi.supercruise ? 'enter' : 'exit' }} supercruise</template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { nextTick, reactive, ref, watch } from 'vue'
import { ui }                             from '@/state/ui'
import { guidance, navi }                 from '@/state/navi'
import { round, ROUND_STATES }            from '@/state/racing'

export default {
  name: 'guide-objective',
  data () { return { ph: '- not set -' }},
  setup () {

    // point label
    const label = ref(navi.label)
    watch(navi, () => {
      label.value = ''
      nextTick(() => label.value = navi.label)
    }, { deep: true })



    // hero message
    const hero_label = reactive({ show: false, text: '' })
    let _hero_timeout = 0
    let _last_round_state = null

    const show_hero_label = (txt, timeout = 3000) => {
      if (_hero_timeout) clearTimeout(_hero_timeout)
      hero_label.text = txt
      hero_label.show = true
      setTimeout(() => { hero_label.show = false }, timeout)
    }

    watch(round, () => {
      if (round.state !== _last_round_state) {
        if (round.state === ROUND_STATES.PREPARATION) show_hero_label('get on start position', 5000)
        if (round.state === ROUND_STATES.COUNTDOWN) show_hero_label('get ready!', 3000)
        if (round.state === ROUND_STATES.IN_PROGRESS) show_hero_label('go!', 3000)
        if (round.state === ROUND_STATES.FINISH) show_hero_label('finished!', 10000)
        _last_round_state = round.state
      }
    }, { immediate: true })

    return {
      label, hero_label,
      round, guidance, navi, ui,
      ROUND_STATES,
    }
  },
  computed: {
    cdowdn () {
      const raw = Math.max(0, round.countdown) / 1000
      const s = Math.floor(Math.max(0, round.countdown) / 1000)
      const ms = raw - s
      return {
        s: String(s).padStart(2, '0'),
        ms: String(Math.floor(ms * 1000)).padStart(3, '0'),
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.header {
  @include typo-caps(300);
  font-weight: bold;
  color: var(--pal-orange);
  display: flex;

  .status {
    color: var(--pal-red);
    padding-left: 0.5em;
  }

  &.complete .status {
    color: var(--pal-blue);
  }

  .label {
    @include ellipsis();

    max-width: 60%;
    margin-left: auto;
  }
}

.objectives {
  @include typo-caps(200);
  display: flex;
  grid-template-columns: auto minmax(0, 1fr);
  border-top: 1px solid rgba(255, 128, 0, 0.1);

  .goal {
    margin-top: -1px;
    border-top: 1px solid var(--pal-orange);
    padding: 0.25rem 0.5rem 0.25rem 1rem;
    flex: 1;
    display: none;

    & .type {
      color: var(--pal-orange);
    }

    & .value {
      @include ellipsis();

      font-weight: bold;
      margin-left: 1em;
    }

    b {
      content: '';
      height: 0.4em;
      width: 0.4em;
      border-radius: 0.4em;
      border-color: var(--pal-orange);
      border-width: 1px;
      border-style: solid;
      display: inline-block;
      background: transparent;
    }

    &.missing,
    &.check {
      display: block;
    }

    &.missing {
      b {
        animation: blinker 200ms infinite;
        border-color: transparent;
        background: var(--pal-red);
      }
    }

    &.check {
      transition: transform linear 200ms;
      transition-delay: 1s;
      will-change: transform;
      transform: scaleX(0);
      transform-origin: 0 0;

      b {
        border-color: transparent;
        background: var(--pal-green);
      }
    }
  }

  &.show-all {
    .title {
      visibility: visible;
    }
    .goal {
      transition-duration: 0s;
      transition-delay: 0s;
      transform: none;
    }
  }
}

.navi-label {
  @include typo(500);

  text-transform: uppercase;
  font-weight: bold;
  text-align: center;
  animation: start-blinker 7500ms forwards;
}

.hero-message {
  @include typo-caps(800);

  text-align: center;
  width: max-content;
  font-weight: bold;
  margin: 1em auto;
  font-style: italic;
  text-transform: uppercase;
  text-shadow: 5px 5px 0 black;
}

.hero-slide-enter-active {
  transition: all 0.2s ease-in;
}

.hero-slide-leave-active {
  transition: all 0.3s ease-in;
}

.hero-slide-enter-from {
  opacity: 0;
  transform: translateX(-5rem);
}

.hero-slide-leave-to {
  opacity: 0;
  transform: translateX(5rem);
}

.countdown {
  @include typo-mono(600);

  color: red;
  letter-spacing: 0.2rem;
  word-spacing: -0.8rem;
  margin: 1em auto;
  padding: 0.5em 5rem;
  background: #0005;
  box-shadow: 0 0 10px 5px #0005;
  width: max-content;
}

@keyframes start-blinker {
  0% {
    transform: rotateX(0);
    opacity: 1;
    visibility: visible;
  }
  1% {
    opacity: 0;
  }
  2% {
    opacity: 1;
  }
  3% {
    opacity: 0;
  }
  4% {
    opacity: 1;
  }
  5% {
    opacity: 0;
  }
  6% {
    opacity: 1;
  }
  7% {
    opacity: 0;
  }
  8% {
    opacity: 1;
  }
  9% {
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  92% {
    opacity: 1;
    transform: rotateX(0);
    visibility: visible;
  }
  100% {
    transform: rotateX(-90deg);
    opacity: 0;
    visibility: hidden;
  }
}
</style>
