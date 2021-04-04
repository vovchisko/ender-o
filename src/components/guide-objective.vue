<template>
  <div class="header" :class="{ 'complete': guidance.is_complete }">
    guidance:
    <span class="status">
      {{ guidance.is_complete ? 'obj. complete' : 'active' }}
    </span>
    <span class="label">
      {{ navi.label }}
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
  </div>
</template>

<script>
import { ui }             from '@/state/ui'
import { guidance, navi } from '@/state/navi'

export default {
  name: 'guide-objective',
  data () { return { ph: '- not set -' }},
  setup () {
    return { guidance, navi, ui }
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


</style>
