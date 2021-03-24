<template>
  <label>
    sysytem
    <input type="text" @input="dest.system" />
  </label>
</template>

<script>
const DEST_TYPE = {
  BODY: 'BODY',
  PLANETARY: 'PLANETARY'
}
export default {
  name: 'dest',
  setup () {
    const dest = {
      type: '
      body:
    }
  },
}
</script>

<style scoped lang="scss">

</style>
