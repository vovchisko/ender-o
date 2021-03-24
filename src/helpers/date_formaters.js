export function rec_t (str) {
  return (new Date(str)).toLocaleTimeString(undefined, { hour12: false })
}

export function rec_dt (str) {
  return (new Date(str)).toLocaleString(undefined, { hour12: false })
}
