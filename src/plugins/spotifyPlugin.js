export default {
  install (Vue, options = {}) {
    const client = options.client
    if (!client) {
      throw new Error('Missing `client` option')
    }
    Object.defineProperty(Vue.prototype, '$spotifyClient', {
      get () {
        return client
      }
    })
  }
}
