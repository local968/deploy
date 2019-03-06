const formatNumber = (str, n = 3, f = false) => {
  if (isNaN(str)) return str
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
    let _d
    if(f) {
      let a = Array.from(d || '')
      if(a.length >= n) {
        a.length = n
      }else{
        a = [...a, ...new Array(n - a.length).fill('0')]
      }
      _d = '.' + a.join('')
    }else{
      _d = d?'.' + d.slice(0, n) : ''
    }
    s = i + _d
  }
  const m = parseFloat(s)
  const isZero = m === -m
  return !isZero ? s : s.indexOf('-') === 0 ? s.slice(1) : s
}

export {
  formatNumber
}