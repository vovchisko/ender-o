export function rec_t (str) {
  return (new Date(str)).toLocaleTimeString(undefined, { hour12: false })
}

export function rec_dt (str) {
  return (new Date(str)).toLocaleString(undefined, { hour12: false })
}

export function minmax (n, min = -Infinity, max = Infinity) {
  return Math.min(Math.max(Number(n), min), max)
}

export function round_n (n, nn = 10, dot_nn) {
  return (Math.floor(n * nn) / nn).toFixed(dot_nn)
}
