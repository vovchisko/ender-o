<template>
  <p>RACING: [WORK IN PROGRESS]</p>

  <div class="panel pan--heading-objectives" v-if="guidance.is_active">
    <guide-objective />
  </div>

  <div class="panel pan--heading"
       v-if="guidance.is_active && navi.type === DEST_TYPE.PLANETARY">
    <guide-heading />
  </div>
</template>

<script>
import GuideHeading        from '@/components/guide-heading'
import GuideObjective      from '@/components/guide-objective'
import { DEST_TYPE, navi, guidance } from '@/state/navi'

export default {
  name: 'racing',
  components: { GuideHeading, GuideObjective },
  setup () {
    return { navi,guidance, DEST_TYPE }
  },
}
</script>

<style lang="scss" scoped>
p {
  @include typo(200);
}
</style>
