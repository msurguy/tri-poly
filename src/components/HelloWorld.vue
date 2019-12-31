<template>
  <div>
    <button @click="redraw">Redraw</button>
    <svg ref="svg" xmlns="http://www.w3.org/2000/svg" :viewBox="`0 0 ${width} ${height}`" version="1.1" ></svg>
  </div>
</template>

<script>
import Vector from '@/lib/Vector'
import Triangle, { svgNs } from '@/lib/Triangle'
import { getRandomPoints, bowyerWatson } from '@/lib/Utils'

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data () {
    return {
      width: 1000,
      height: 1000,
      svgEl: null
    }
  },
  mounted () {
    this.svgEl = this.$refs.svg
  },
  methods: {
    redraw () {
      let group = document.querySelector('g')
      if (group) {
        group.remove()
      }
      group = document.createElementNS(svgNs, 'g')

      let pointList = getRandomPoints(this.width, this.height)

      let superTriangle = new Triangle(
        new Vector(-this.width * 10, this.height * 10),
        new Vector(this.width * 10, this.height * 10),
        new Vector(this.width / 2, -this.height * 10)
      )

      let triangles = bowyerWatson(superTriangle, pointList)
      triangles.forEach(t => t.draw(group))
      this.svgEl.appendChild(group)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
