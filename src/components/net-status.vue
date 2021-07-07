<template>
  <div class="net-stat" :class="{
    is_online: net.stat.is_online,
    is_error: net.stat.is_error
  }">
    {{ net.stat.text }}
  </div>
</template>

<script>
import { net } from '@/modules/net'

export default {
  name: 'net-status',
  setup () {
    return { net }
  },
}
</script>

<style scoped lang="scss">
.net-stat {
  line-height: 1rem;
  --stat-color: rgba(255, 255, 255, .5);

  font-weight: bold;
  display: inline-flex;
  align-items: center;
  color: var(--stat-color);

  &:before {
    display: block;
    content: "";
    height: 0.75rem;
    width: 0.75rem;
    border-radius: 1rem;
    background-color: var(--stat-color);
    margin-right: 0.5rem;
  }

  &.is_error {
    --stat-color: red;
  }
  &.is_online {
    --stat-color: #00b500;
  }
}

</style>
