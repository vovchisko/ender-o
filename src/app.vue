<template>
  <div class="app">
    <div class="header">
      <button v-for="screen in SCREENS" @click="show_screen(screen)">
        {{ screen }}
      </button>

      <button class="quit" @click="quit">quit</button>
    </div>

    <development v-if="ui.screen === SCREENS.DEVELOPMENT" />
    <exploration v-if="ui.screen === SCREENS.EXPLORATION" />
    <racing v-if="ui.screen === SCREENS.RACING" />
  </div>
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

<style lang="scss">
html, body { background: transparent; }


body {
  font-family: Titillium, sans-serif;
  color: #ddd;
}

.caps {
  font-family: EuroCaps, sans-serif;
}

body[overlay='on'] {
  border-top: 2px solid transparent;
  padding-top: 1rem;

  &[interact='on'] {
    background: rgba(0, 0, 0, .45);
    border-top: 2px solid rgba(255, 165, 0, 0.45);
    overflow-x: hidden
  }

  &[interact='off'] {
    background: transparent;
  }
}

body[overlay='off'] {
  background: #222 !important;
}
</style>

<style lang="scss" scoped>
.app {
  &__header {
    &-menu-btn {
      border: 0 none;

      &_quit {
        margin-left: auto;
      }
    }
  }
}
</style>
