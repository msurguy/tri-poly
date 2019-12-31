import Triangle from './Triangle'
import Vector from './Vector'

export function getRandomPoints (width, height) {
  // console.log(w, height)
  let pointList = []
  // let div = Math.random() * 20 + 5000
  let nrOfPoints = 20 // w * height / div;
  for (let i = 0; i < nrOfPoints; i++) {
    // TODO: distribute points on a circle, hexagon, triangle, pentagon, square, rectangle, etc
    // maybe points within a shape?
    // points on perimeter also need to be placed
    pointList.push(new Vector(
      Math.random() * width,
      Math.random() * height
    ))
  }

  // TODO: evenly distribute new points on the edges of the rectangle

  // pointList.push(new Vector(0, 0));
  // pointList.push(new Vector(0, height/2));
  // pointList.push(new Vector(0, height));
  // pointList.push(new Vector(w, 0));
  // pointList.push(new Vector(w, height/2));
  // pointList.push(new Vector(w/2, 0));
  // pointList.push(new Vector(w/2, height/2));
  // pointList.push(new Vector(0, w/2));
  // pointList.push(new Vector(w, height));

  return pointList
}

export function bowyerWatson (superTriangle, pointList) {
  // pointList is a set of coordinates defining the
  // points to be triangulated
  let triangulation = []

  // add super-triangle to triangulation
  // must be large enough to completely contain all
  // the points in pointList
  triangulation.push(superTriangle)

  // add all the points one at a time to the triangulation
  pointList.forEach(point => {
    let badTriangles = []

    // first find all the triangles that are no
    // longer valid due to the insertion
    triangulation.forEach(triangle => {
      if (triangle.pointIsInsideCircumcircle(point)) {
        badTriangles.push(triangle)
      }
    })
    let polygon = []

    // find the boundary of the polygonal hole
    badTriangles.forEach(triangle => {
      triangle.edges().forEach(edge => {
        let edgeIsShared = false
        badTriangles.forEach(otherTriangle => {
          if (triangle !== otherTriangle && otherTriangle.hasEdge(edge)) {
            edgeIsShared = true
          }
        })
        if (!edgeIsShared) {
          // edge is not shared by any other
          // triangles in badTriangles
          polygon.push(edge)
        }
      })
    })

    // remove them from the data structure
    badTriangles.forEach(triangle => {
      let index = triangulation.indexOf(triangle)
      if (index > -1) {
        triangulation.splice(index, 1)
      }
    })

    // re-triangulate the polygonal hole
    polygon.forEach(edge => {
      // form a triangle from edge to point
      let newTri = new Triangle(edge[0], edge[1], point)
      triangulation.push(newTri)
    })
  })

  // done inserting points, now clean up
  let i = triangulation.length
  while (i--) {
    let triangle = triangulation[i]
    if (triangle.sharesAVertexWith(superTriangle)) {
      // remove triangle from triangulation
      let index = triangulation.indexOf(triangle)
      if (index > -1) {
        triangulation.splice(index, 1)
      }
    }
  }

  return triangulation
}
