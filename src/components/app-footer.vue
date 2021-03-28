<template>
  <footer v-bind="$attrs" :class="{ 'hide': !ui.is_interact }">
    <p>ender-o / CMDR {{ cmdr.name }} / {{ cmdr.mode }} / {{ cmdr.squadron }}</p>
  </footer>
</template>

<script>
import { cmdr } from '@/state/cmdr'
import { ui }   from '@/state/ui'

export default {
  name: 'app-footer',

  setup () {
    return { cmdr, ui }
  },
}
</script>

<style lang="scss" scoped>
p {
  @include typo-caps();
}

.hide {
  visibility: hidden;
}
</style>
