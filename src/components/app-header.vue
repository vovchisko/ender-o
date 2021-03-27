<template>
  <header v-bind="$attrs">
    <template v-if="ui.is_interact">
      <button
          v-for="screen in SCREENS"
          :key="screen"
          @click="show_screen(screen)"
          :class="{'active': ui.screen === screen}"
      >
        {{ screen }}
      </button>
      <button class="quit" @click="quit">quit</button>
    </template>
    <template v-else>
      <h1 class="mode-title">mode: {{ ui.screen }}</h1>
    </template>
  </header>
</template>

<script>
import { ipcr }        from '@/modules/ipcr'
import { SCREENS, ui } from '@/state/ui'

export default {
  name: 'app-header',
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

<style scoped lang="scss">
header {
  display: flex;

  button {
    margin-right: 8px;
  }

  .mode-title {
    @include typo-caps(400);
  }

  .quit { margin-left: auto; }
}
</style>
