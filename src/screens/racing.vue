<template>
  <p>RACING: [WORK IN PROGRESS]</p>

  <guide-objective v-if="guidance.is_active" />
  <guide-heading v-if="guidance.is_active && guidance.objectives.planet === true" />

  <!-- todo: list of tracks if round isn't started -->


</template>

<script>
import GuideHeading                  from '@/components/guide-heading'
import GuideObjective                from '@/components/guide-objective'
import { DEST_TYPE, guidance, navi } from '@/state/navi'

export default {
  name: 'racing',
  components: { GuideHeading, GuideObjective },
  setup () {
    return { navi, guidance, DEST_TYPE }
  },
}
</script>

<style lang="scss" scoped>
p {
  @include typo(200);
}
</style>
