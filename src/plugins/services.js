const services = ['settings', 'spotifyClient']

export default {
  install (Vue, options = {}) {
    services.forEach(serviceName => {
      const service = options[serviceName]
      if (!service) {
        throw new Error(`ServicesPlugin: missing '${serviceName}' option`)
      }

      Object.defineProperty(Vue.prototype, `$${serviceName}`, {
        get () {
          return service
        }
      })
    })
  }
}
