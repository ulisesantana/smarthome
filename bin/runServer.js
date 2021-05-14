const { buildServer } = require('../build/src/server')

const PORT = process.env.PORT ?? 3000
const docsRoute = process.env.DOCS_ROUTE ?? '/docs'
const docsHost = `0.0.0.0:${PORT}`

buildServer({ docsHost, docsRoute }).then(server => {
  server.listen(PORT, '0.0.0.0', (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`Server listening at ${address}. Running on ${process.env.NODE_ENV} mode.`)
  })
}).catch(err => {
  console.log('Error starting Smarthome API:', err.toString())
})
