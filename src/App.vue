<template>
  <div id="app">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'app',
  components: {
    HelloWorld
  }
}
</script>

<style lang="scss">
html, body {
  height: 100%;
  margin: 0;
}

svg {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
