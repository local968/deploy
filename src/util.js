const formatNumber = (str, n = 3, f = false) => {
  if (isNaN(parseFloat(str))) return str
  str = str.toString()
  let i, d
  if (str.indexOf('.')) {
    i = str.split('.')[0]
    d = str.split('.')[1]
  } else {
    i = str
  }

  const left = i.length % 3
  let s = i.split('').reduce((prev, curr, index) => {
    if (index === left - 1 && index !== i.length - 1) return prev + curr + ','
    if ((index + 1 - left) % 3 === 0 && index !== i.length - 1) return prev + curr + ','
    return prev + curr
  }, '')
  if (n > 0) {
    let a = Array.from(d || '')
    if (a.length >= n) {
      a.length = n
    } else {
      a = [...a, ...new Array(n - a.length).fill('0')]
    }
    if (!f) {
      let i = a.length
      for (; i > -1; i--) {
        if (i === 0) break
        if (a[i - 1] !== '0') break
      }
      a = a.slice(0, i)
    }
    const _d = a.join('')
    s += _d ? "." + _d : ""
  }
  const m = parseFloat(s)
  const isZero = m === -m
  return !isZero ? s : s.indexOf('-') === 0 ? s.slice(1) : s
}

export {
  formatNumber
}