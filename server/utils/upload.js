export default () => axios
  .post(this.path, chunk, {
    headers: {
      'content-disposition': `attachment; filename=""`,
      'content-type': 'application/octet-stream',
      'content-range': `bytes 0-${size}/${size}`,
      'session-id': this.sessionId,
      ...this.headers
    },
  })
