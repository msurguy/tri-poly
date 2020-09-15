<template>
  <div class="page">
    <!-- Sidebar -->
    <div class="sidebar">
      <div class="controls-wrapper">
        <div class="controls">
          <button type="button" class="btn btn-block btn-primary" @click="redraw">Draw</button>
          <slider :min="100" :max="1600" :step="1" label="Paper Width" v-model.number="appState.width"></slider>
          <slider :min="100" :max="1600" :step="1" label="Paper Height" v-model.number="appState.height"></slider>
          <slider :min="3" :max="1000" :step="1" label="Vertices" v-model.number="appState.points"></slider>
          <slider :min="1" :max="10" :step="1" label="Max Divisions" v-model.number="appState.divisions"></slider>
          <toggle label="Randomize Stroke Width" v-model="appState.randomStroke"></toggle>
          <slider :disabled="appState.randomStroke" :min="1" :max="5" :step="1" label="Stroke Width" v-model.number="appState.strokeWidth"></slider>
          <color-picker :disable-alpha="true" @colorChange="setColor" label="Stroke" v-model="strokeColor"></color-picker>
          <color-picker :disable-alpha="true" @colorChange="setBackgroundColor" label="Background" v-model="bgColor"></color-picker>
        </div>
      </div>
      <div class="bottom-sheet">
        <div class="reveal"></div>
        <div class="d-flex download-wrapper">
          <button class="btn btn-primary btn-block" @click.prevent="download">
            Download SVG <svg viewBox="0 6 32 32" width="16" height="16" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
            <path d="M28 22 L28 30 4 30 4 22 M16 4 L16 24 M8 16 L16 24 24 16"></path>
          </svg>
          </button>
        </div>
      </div>
    </div>
    <!-- Page Content -->
    <div class="paper">
      <div class="sketch">
        <div id="drawing">
          <svg ref="svg" xmlns="http://www.w3.org/2000/svg" :viewBox="`0 0 ${appState.width} ${appState.height}`" version="1.1" :width="appState.width" :height="appState.height"></svg>
        </div>
      </div>
    </div>

    <div class="sharing-wrapper">
      <span class="text-black-50 small">Share this: </span> <a target="_blank" :href="`https://twitter.com/intent/tweet?text=Triangulation%20SVG%20generator&url=${sharingURL}&via=msurguy&hashtags=TriPoly%2CSVG`">
      <svg viewBox="0 0 64 64" width="22" height="22"><path stroke-width="0" fill="currentColor" d="M60 16 L54 17 L58 12 L51 14 C42 4 28 15 32 24 C16 24 8 12 8 12 C8 12 2 21 12 28 L6 26 C6 32 10 36 17 38 L10 38 C14 46 21 46 21 46 C21 46 15 51 4 51 C37 67 57 37 54 21 Z"></path> </svg>
    </a>
    </div>
    <div class="footer-wrapper">
      <div class="footer">
        <h2>Tri Poly</h2>
        <p class="small">Project by <a target="_blank" href="http://twitter.com/msurguy">@msurguy</a>
          <br>
          based on work of <a target="_blank" href="https://twitter.com/DonKarlssonSan">Johan Karlsson</a> |
          <a target="_blank" href="http://github.com/msurguy/tri-poly">Source</a> | <a target="_blank" href="https://github.com/sponsors/msurguy">Support</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { svgNs } from '@/lib/Triangle'
import { getSuperTriangle, getRandomPoints, bowyerWatson } from '@/lib/Utils'

import { appState, qs } from './appState'
import { generateDownload } from './lib/svgDownload'
import ColorPicker from './components/ColorPicker/ColorPicker'
import Slider from './components/Slider'
import Toggle from './components/Toggle'
import * as query from 'query-state/lib/query'
import debounce from 'lodash.debounce'

const projectURL = 'https://msurguy.github.io/tri-poly/'

export default {
  name: 'App',
  components: {
    ColorPicker,
    Slider,
    Toggle
  },
  data () {
    return {
      strokeColor: {
        hex: appState.color
      },
      bgColor: {
        hex: appState.bg
      },
      appState,
      paper: {
        width: appState.width, // width and height of SVG canvas
        height: appState.height
      },
      sharingURL: projectURL
    }
  },
  mounted () {
    this.redraw()
    this.updateSharingURL(false)
  },
  methods: {
    redraw () {
      const width = this.appState.width
      const height = this.appState.height
      const howManyPoints = this.appState.points
      const thickness = this.appState.strokeWidth
      const randomThickness = this.appState.randomStroke
      const howManyLines = this.appState.divisions
      let group = this.$refs.svg.querySelector('g')
      if (group) {
        group.remove()
      }
      group = document.createElementNS(svgNs, 'g')

      const pointList = getRandomPoints(width, height, howManyPoints)
      const superTriangle = getSuperTriangle(width, height)
      const triangles = bowyerWatson(superTriangle, pointList)
      triangles.forEach(t => t.draw(group, howManyLines, thickness, randomThickness))
      this.$refs.svg.appendChild(group)

      if (this.appState.color) {
        this.setStrokeColor(this.appState.color)
      }

      if (this.appState.bg) {
        this.redrawBackground(this.appState.bg)
      }
    },
    setColor (value) {
      this.setStrokeColor(value)
      this.appState.color = value
    },
    setStrokeColor (value) {
      const paths = this.$refs.svg.querySelectorAll('path')
      for (let path of paths) {
        path.setAttribute('stroke', value)
      }
    },
    setStrokeWidth (value) {
      const paths = this.$refs.svg.querySelectorAll('path, polygon')
      for (let path of paths) {
        path.setAttribute('stroke-width', value)
      }
    },
    setBackgroundColor (value) {
      this.appState.bg = value
      if (this.appState.bg) {
        this.redrawBackground(value)
      }
    },
    redrawBackground (value) {
      const existingRect = this.$refs.svg.querySelectorAll('rect')
      if (existingRect && existingRect.length > 0) existingRect[0].remove()
      let rect = document.createElementNS(svgNs, 'rect')
      rect.setAttribute('width', this.appState.width)
      rect.setAttribute('height', this.appState.height)
      rect.setAttribute('fill', value)
      this.$refs.svg.insertBefore(rect, this.$refs.svg.firstChild)
    },
    download () {
      generateDownload(this.$refs.svg)
    },
    updateSharingURL (appendQuery) {
      const queryPresent = window.location.href.indexOf('?') >= 0
      const queryPrefix = (appendQuery || queryPresent) ? '?' : ''
      // For twitter, we need to replace = and & with HTML encoded characters
      const encodedURL = query.stringify(qs.get())
      this.sharingURL = encodeURIComponent(projectURL + queryPrefix + encodedURL)
    }
  },
  watch: {
    appState: {
      handler () {
        // Need to wait until all items in appState is updated
        this.$nextTick(function () {
          this.updateSharingURL(true)
        })
      },
      deep: true
    },
    'appState.width': debounce(function (value) {
      qs.set({ width: value })
      this.redraw()
    }, 100),
    'appState.points': debounce(function (value) {
      qs.set({ points: value })
      this.redraw()
    }, 300),
    'appState.height': debounce(function (value) {
      qs.set({ height: value })
      this.redraw()
    }, 300),
    'appState.color' (value) {
      qs.set({ color: value })
    },
    'appState.strokeWidth' (value) {
      qs.set({ sw: value })
      this.setStrokeWidth(value)
      // SVGCanvas.select('polyline').stroke({ width: value })
    },
    'appState.randomStroke' (value) {
      qs.set({ randomStroke: value })
      this.redraw()
    },
    'appState.divisions' (value) {
      qs.set({ divisions: value })
      this.redraw()
    },
    'appState.bg' (value) {
      qs.set({ bg: value })
    }
  }
}
</script>

<style scoped lang="scss">
  .page {
    min-height: 100vh;
    position: relative;
    height: 100%;
    display: flex;
  }

  .sharing-wrapper {
    z-index: 1001;
    position: absolute;
    top: 0;
    right: 0;
    color: #2D2D2D;
    padding: 10px;
  }

  .controls-wrapper {
    max-height: 100vh;
    overflow: auto;
    position: relative;
    z-index: 2;
  }

  .controls {
    background-color: grey;
    width: 100%;
    margin-bottom: 60px;
    position: relative;
    height: auto;
  }

  .bottom-sheet {
    position: absolute;
    bottom: 0;
    width: 100%;
    text-align: center;
    z-index: 3;
  }

  .download-wrapper {
    background-color: #393939;
  }

  .reveal {
    display: block;
    height: 15px;
    pointer-events: none;
    background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 20%, rgb(47, 47, 47) 100%);
  }

  .paper {
    background-color: #dedede;
    position: relative;
    max-height: 100vh;
    width: calc(100% - 300px);
    overflow: scroll;
    padding: 10px;
    z-index: 1;
  }

  #drawing {
    display: inline-block;
    border: 10px solid #FFFFFF;
  }

  .sidebar {
    z-index: 10;
    width: 300px;
    position: relative;
    box-shadow: 0 0 5px 6px rgba(97, 94, 94, 0.45);
  }

  .footer-wrapper {
    z-index: 1000;
    position: absolute;
    bottom: 0;
    right: 0;
    color: #2D2D2D;
  }

  .footer {
    padding: 15px 15px 0 15px;
    text-align: right;
  }

  @media (max-width: 767px) {
    .page {
      flex-direction: column-reverse;
    }

    .controls-wrapper {
      max-height: none;
    }

    .sharing-wrapper {
      position: absolute;
      left: 0;
      padding: 15px;
    }

    .sidebar {
      width: 100%;
    }

    .paper {
      width: 100%;
      max-height: none;
      overflow: hidden;
    }

    .footer-wrapper {
      position: relative;
      background-color: #CCC;
    }
  }
</style>
