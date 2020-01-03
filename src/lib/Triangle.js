/*
  Johan Karlsson, 2019
  https://twitter.com/DonKarlssonSan
  MIT License, see Details View

  Similar triangles (side splitting theorem):
  http://www.malinc.se/math/geometry/similartrianglesen.php
  https://en.wikipedia.org/wiki/Delaunay_triangulation
  https://en.wikipedia.org/wiki/Bowyer%E2%80%93Watson_algorithm
  https://en.wikipedia.org/wiki/Circumscribed_circle
*/
import Vector from './Vector'
export const svgNs = 'http://www.w3.org/2000/svg'
export default class Triangle {
  constructor (a, b, c) {
    this.a = a
    this.b = b
    this.c = c
  }

  vertices () {
    return [this.a, this.b, this.c]
  }

  verticesAsString () {
    return `M${this.vertices().map(vertex => `${vertex.x} ${vertex.y}`).join(' ')}Z`
  }

  angleBetweenPoints (a, b, c) {
    const A1x = a.x
    const A1y = a.y
    const A2x = b.x
    const A2y = b.y
    const B1x = c.x
    const B1y = c.y
    const B2x = A2x
    const B2y = A2y

    const dAx = A2x - A1x
    const dAy = A2y - A1y
    const dBx = B2x - B1x
    const dBy = B2y - B1y
    let angle = Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy)
    if (angle < 0) { angle = angle * -1 }
    return angle * (180 / Math.PI)
  }

  draw (groupElement, howManyLines = 6, thickness = 1, randomThickness) {
    let strokeWidth = randomThickness ? Math.random() * 2 + 1 : thickness
    let polygon = document.createElementNS(svgNs, 'path')
    polygon.setAttribute('d', this.verticesAsString())
    polygon.setAttribute('fill', 'none')
    polygon.setAttribute('stroke', 'black')
    polygon.setAttribute('stroke-linecap', 'round')
    polygon.setAttribute('stroke-linejoin', 'round')

    // Similar triangles, see link at the top
    let nrOfPoints = Math.round(Math.random() * howManyLines + 1)

    const angleAB = this.angleBetweenPoints(this.a, this.b, this.c)
    const angleBC = this.angleBetweenPoints(this.b, this.c, this.a)
    const angleAC = this.angleBetweenPoints(this.c, this.a, this.b)

    const lengthAB = this.a.distanceTo(this.b)
    const lengthBC = this.b.distanceTo(this.c)
    const lengthAC = this.c.distanceTo(this.a)

    // If angle between any sides is less than 45 degrees, make two cuts of triangle
    if (angleAB < 45 || angleBC < 45 || angleAC < 45 || lengthAB < 30 || lengthBC < 30 || lengthAC < 30) nrOfPoints = 2
    // if angle is less than 30 degrees, make a single cut on the triangle
    if (angleAB < 30 || angleBC < 30 || angleAC < 30 || lengthAB < 15 || lengthBC < 15 || lengthAC < 15) nrOfPoints = 1
    // if angle is less than 15 degrees, don't make any cuts on the triangle
    if (angleAB < 15 || angleBC < 15 || angleAC < 15 || lengthAB < 10 || lengthBC < 10 || lengthAC < 10) nrOfPoints = 0

    polygon.setAttribute('stroke-width', strokeWidth)
    groupElement.appendChild(polygon)

    let points1 = this.getPoints(this.c, this.a, nrOfPoints)
    let points2 = this.getPoints(this.c, this.b, nrOfPoints)
    for (let i = 0; i < nrOfPoints; i++) {
      let line = document.createElementNS(svgNs, 'path')
      line.setAttribute('d', `M ${points1[i].x} ${points1[i].y} ${points2[i].x} ${points2[i].y}`)
      line.setAttribute('stroke', 'black')
      line.setAttribute('stroke-width', strokeWidth)
      groupElement.appendChild(line)
    }
  }

  getPoints (p1, p2, nrOfPoints) {
    let points = []
    let delta = p1.sub(p2).div(nrOfPoints + 1)
    for (let i = 1; i < nrOfPoints + 1; i++) {
      let currentPos = p2.add(delta.mult(i))
      points.push(currentPos)
    }
    return points
  }

  edges () {
    return [
      [this.a, this.b],
      [this.b, this.c],
      [this.c, this.a]
    ]
  }

  sharesAVertexWith (triangle) {
    // TODO: optimize me please!
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let v = this.vertices()[i]
        let vv = triangle.vertices()[j]
        if (v.equals(vv)) {
          return true
        }
      }
    }
    return false
  }

  hasEdge (edge) {
    for (let i = 0; i < 3; i++) {
      let e = this.edges()[i]
      // eslint-disable-next-line no-mixed-operators
      if (e[0].equals(edge[0]) && e[1].equals(edge[1]) || e[1].equals(edge[0]) && e[0].equals(edge[1])) {
        return true
      }
    }
    return false
  }

  circumcenter () {
    let d = 2 * (this.a.x * (this.b.y - this.c.y) +
      this.b.x * (this.c.y - this.a.y) +
      this.c.x * (this.a.y - this.b.y))

    let x = 1 / d * ((this.a.x * this.a.x + this.a.y * this.a.y) * (this.b.y - this.c.y) +
      (this.b.x * this.b.x + this.b.y * this.b.y) * (this.c.y - this.a.y) +
      (this.c.x * this.c.x + this.c.y * this.c.y) * (this.a.y - this.b.y))

    let y = 1 / d * ((this.a.x * this.a.x + this.a.y * this.a.y) * (this.c.x - this.b.x) +
      (this.b.x * this.b.x + this.b.y * this.b.y) * (this.a.x - this.c.x) +
      (this.c.x * this.c.x + this.c.y * this.c.y) * (this.b.x - this.a.x))

    return new Vector(x, y)
  }

  circumradius () {
    return this.circumcenter().sub(this.a).getLength()
  }

  pointIsInsideCircumcircle (point) {
    let circumcenter = this.circumcenter()
    let circumradius = circumcenter.sub(this.a).getLength()
    let dist = point.sub(circumcenter).getLength()
    return dist < circumradius
  }
}
