<template>
  <div class="layout">
    <guide-heading class="heading" />
    TODO: RACE!
  </div>
</template>

<script>
import GuideHeading from '@/components/guide-heading'

export default {
  name: 'racing',
  components: { GuideHeading },
}
</script>

<style lang="scss" scoped>
p {
  @include typo(200);
}
</style>
