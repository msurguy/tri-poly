<template>
  <div>
    <button @click="redraw">Redraw</button>
    <svg ref="svg" xmlns="http://www.w3.org/2000/svg" :viewBox="`0 0 ${width} ${height}`" version="1.1" ></svg>
  </div>
</template>

<script>
import { svgNs } from '@/lib/Triangle'
import { getSuperTriangle, getRandomPoints, bowyerWatson } from '@/lib/Utils'

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data () {
    return {
      width: 1000,
      height: 1000
    }
  },
  methods: {
    redraw () {
      let group = this.$refs.svg.querySelector('g')
      if (group) {
        group.remove()
      }
      group = document.createElementNS(svgNs, 'g')

      const pointList = getRandomPoints(this.width, this.height)
      const superTriangle = getSuperTriangle(this.width, this.height)
      const triangles = bowyerWatson(superTriangle, pointList)
      triangles.forEach(t => t.draw(group))
      this.$refs.svg.appendChild(group)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
