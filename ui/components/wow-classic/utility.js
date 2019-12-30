/**
 * Utility functions
 */

export default {
  // Parses a numeric price into gold, silver, copper
  parsePrice (price) {
    const gold = Math.floor(price / 10000)
    const silver = Math.floor(price / 100 - gold * 100)
    const copper = price - gold * 10000 - silver * 100
    // return { gold, silver, copper }
    let string = ''
    if (gold) string += `${gold}g `
    if (silver) string += `${silver}s `
    string += `${copper}c`
    return string
  },

  // Pushes url with correct region + server
  pushUrl (self, url) {
    self.$router.push(this.formatUrl(self, url))
  },

  // Formats url with correct region + server
  formatUrl (self, url) {
    const params = url.split('?')
    const routeArgs = params[0].split('/')

    // Insert region and server into route
    const region = self.$store.state.servers.selectedRegion
    const server = self.$store.state.servers.selectedServer
    const faction = self.$store.state.servers.selectedFaction
    if (region !== 'All Regions') {
      routeArgs.splice(3, 0, region.toLowerCase())
      if (server !== 'All Servers') {
        routeArgs.splice(4, 0, this.serverSlug(server))
        if (faction !== 'All Factions') routeArgs.splice(5, 0, faction.toLowerCase())
      }
    }

    params[0] = routeArgs.join('/')
    return params.join('?')
  },

  // Changes server name to server slug
  serverSlug (server) {
    return server.toLowerCase().replace(/\s/g, '-').replace(/'/g, '')
  },

  // Edit and interpolate data for regional graph
  formatRegionalData (itemData, regionalData) {
    const msH = 1000 * 60 * 60
    for (const iD of itemData.data) {
      const bracketHour = new Date(Math.floor(new Date(iD.scannedAt).getTime() / msH) * msH)
      const bracketIndex = regionalData.data.findIndex((x) => new Date(x.scannedAt).getTime() === bracketHour.getTime())
      if (bracketIndex >= 0) regionalData.data[bracketIndex].value2 = iD.marketValue
    }
    let validValue = regionalData.data.find((e) => e.value2) // Get first valid value
    if (validValue) validValue = validValue.value2
    for (const rD of regionalData.data) {
      if (!validValue) rD.value2 = null
      else if (!rD.value2) rD.value2 = validValue
      else if (rD.value2) validValue = rD.value2
    }
    return regionalData
  },

  /**
   * Generates a nice looking graph scala with a given tick amount and returns { tickRange, lowerBound, upperBound }
   * If a property is given, it assumes you're passing an array of objects with the data being this property
   * Taken from https://stackoverflow.com/questions/326679/choosing-an-attractive-linear-scale-for-a-graphs-y-axis
   */
  generateGraphScala (data, ticks, prop = false) {
    if (prop) data = data.map(x => x[prop])

    let lowerBound = Math.min(...data)
    let upperBound = Math.max(...data)
    let tickRange = (upperBound - lowerBound) / (ticks - 1)

    // Determine rounded tick range
    const x = Math.ceil(Math.log10(tickRange) - 1)
    const pow10x = Math.pow(10, x)
    tickRange = Math.ceil(tickRange / pow10x) * pow10x

    // Adjust bounds
    lowerBound = tickRange * Math.round(lowerBound / tickRange)
    upperBound = tickRange * Math.round(1 + upperBound / tickRange)

    return { tickRange, lowerBound, upperBound }
  }
}
