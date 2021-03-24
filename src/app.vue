<template>
  <header class="header">
    <button
        v-for="screen in SCREENS"
        :key="screen"
        @click="show_screen(screen)"
        :class="{'active': ui.screen === screen}"
    >
      {{ screen }}
    </button>
    <button class="quit" @click="quit">quit</button>
  </header>

  <development v-if="ui.screen === SCREENS.DEVELOPMENT" class="screen" />
  <exploration v-if="ui.screen === SCREENS.EXPLORATION" class="screen" />
  <racing v-if="ui.screen === SCREENS.RACING" class="screen" />

  <footer>ender-o:dev</footer>
</template>

<script>
import { SCREENS, ui } from '@/state/ui'

import Development from '@/screens/development'
import Exploration from '@/screens/exploration'
import Racing      from '@/screens/racing'
import { ipcr }    from '@/modules/ipcr'

export default {
  components: {
    Development,
    Exploration,
    Racing,
  },

  setup () {
    return { ui, SCREENS }
  },

  methods: {
    show_screen (s) {
      this.ui.screen = s
    },
    quit () {
      ipcr.quit()
    },
  },
}
</script>

<style lang="scss" scoped>

.header {
  &-menu-btn {
    border: 0 none;

    &_quit {
      margin-left: auto;
    }
  }
}

.screen {
  top: var(--lt-header-h);
  bottom: 0;
  right: 0;
  left: 0;
}
</style>
