const formatNumber = (str, n = 3) => {
  if (isNaN(str)) return str
  str = str.toString()
  let i, d
  if (str.indexOf('.')) {
    i = str.split('.')[0]
    d = str.split('.')[1]
  } else {
    i = str
  }

  const left = i.length % n
  i = i.split('').reduce((prev, curr, index) => {
    if (index === left - 1 && index !== i.length - 1) return prev + curr + ','
    if ((index + 1 - left) % n === 0 && index !== i.length - 1) return prev + curr + ','
    return prev + curr
  }, '')
  if (d) return i + '.' + d.slice(0, n)
  return i
}

export {
  formatNumber
}