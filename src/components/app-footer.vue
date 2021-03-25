<template>
  <footer v-bind="$attrs">
    <p>ender-o footer</p>
  </footer>
</template>

<script>
export default {
  name: 'app-footer',
}
</script>

<style scoped lang="scss">
p {
  @include typo-caps();
}
</style>
