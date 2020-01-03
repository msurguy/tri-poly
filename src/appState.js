import queryState from 'query-state'

export const qs = queryState({}, { useSearch: true })

const currentStateFromQuery = qs.get()

export const defaults = {
  width: 800,
  height: 800,
  color: '#000000',
  bg: null,
  strokeWidth: 1,
  randomStroke: true,
  points: 100,
  divisions: 6
}

export const appState = {
  color: currentStateFromQuery.color || defaults.color,
  width: currentStateFromQuery.width || defaults.width,
  height: currentStateFromQuery.height || defaults.height,
  bg: currentStateFromQuery.bg || defaults.bg,
  strokeWidth: currentStateFromQuery.sw || defaults.strokeWidth,
  randomStroke: (typeof currentStateFromQuery.randomStroke === 'undefined') ? defaults.randomStroke : currentStateFromQuery.randomStroke,
  points: currentStateFromQuery.points || defaults.points,
  divisions: currentStateFromQuery.divisions || defaults.divisions
}
