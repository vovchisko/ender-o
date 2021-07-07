<template>
  <footer v-bind="$attrs" class="app-footer" :class="{ 'hide': !ui.is_interact }">
      <p>ender-o / CMDR {{ cmdr.name }} / {{ cmdr.mode }} / {{ cmdr.squadron }}</p>
      <net-status class="net-stat" />
  </footer>
</template>

<script>
import { cmdr }  from '@/state/cmdr'
import { ui }    from '@/state/ui'
import NetStatus from '@/components/net-status'

export default {
  name: 'app-footer',
  components: { NetStatus },
  setup () {
    return { cmdr, ui }
  },
}
</script>

<style lang="scss" scoped>
.app-footer {
  @include typo-caps(300);

  display: flex;
  justify-content: space-between;

  .net-stat {
    margin-left: auto;
  }

  .hide {
    visibility: hidden;
  }
}


</style>
