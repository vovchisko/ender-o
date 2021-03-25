<template>
  <div class="app">
    <app-header class="header" />

    <main class="screen"
          :class="{'screen-fx-blur': ui.blur_screen, 'screen-fx-hide': ui.hide_screen }">
      <devtools v-if="ui.screen === SCREENS.DEVELOPMENT" />
      <exploration v-if="ui.screen === SCREENS.EXPLORATION" />
      <racing v-if="ui.screen === SCREENS.RACING" />
    </main>

    <app-footer class="footer" />
  </div>
</template>

<script>
import { SCREENS, ui } from '@/state/ui'

import Devtools    from '@/screens/devtools'
import Exploration from '@/screens/exploration'
import Racing      from '@/screens/racing'
import AppHeader   from '@/components/app-header'
import AppFooter   from '@/components/app-footer'

export default {
  components: {
    AppHeader,
    AppFooter,
    Devtools,
    Exploration,
    Racing,
  },

  setup () {
    return { ui, SCREENS }
  },
}
</script>

<style lang="scss" scoped>
.app {
  position: absolute;
  top: var(--lt-screen-pad);
  right: var(--lt-screen-pad);
  bottom: var(--lt-screen-pad);
  left: var(--lt-screen-pad);

  display: grid;
  grid-gap: 5px;
  grid-template-rows:
      minmax(0, var(--lt-header-h))
      auto
      minmax(0, var(--lt-footer-h));

  .header, .footer, .screen {
    overflow: hidden;
  }

  .header {
    height: var(--lt-header-h);
  }

  .screen {
    overflow: hidden;
    transition: all linear 200ms;

    &-fx-blur {
      opacity: 0.8;
      // filter: blur(7px); // todo: bright it back later
    }

    &-fx-hide {
      display: none;
    }
  }

  .footer {
    height: var(--lt-footer-h);
  }
}
</style>

<!-- GLOBAL OVERLAY FEEDBACK -->
<style lang="scss">
body {
  border-top: 3px solid transparent;
}

body[overlay='on'] {
  &[interact='on'] {
    background: rgba(0, 0, 0, .55);
    border-top: 3px solid rgba(255, 165, 0, 0.5);
  }

  &[interact='off'] {
    background: transparent;
  }
}

body[overlay='off'] {
  background: #222 !important;
}
</style>
