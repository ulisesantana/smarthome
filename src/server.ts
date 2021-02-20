import fastify from 'fastify'
import {
  generateSwaggerConfig,
  fastifyDevelopmentOptions,
  fastifyProductionOptions
} from './config'

const isDevEnv = process.env.NODE_ENV === 'development'
const PORT = process.env.PORT ?? 3000
const docsRoute = process.env.DOCS_ROUTE ?? '/docs'
const docsHost = `0.0.0.0:${PORT}`

async function start (): Promise<void> {
  const server = isDevEnv
    ? fastify(fastifyDevelopmentOptions)
    : fastify(fastifyProductionOptions)

  if (isDevEnv) {
    await server.register(import('fastify-swagger'), generateSwaggerConfig(docsHost, docsRoute))
    console.log(`Check ${docsRoute} for SwaggerUI`)
  }

  await server.register(import('./app'))

  try {
    await server.listen(PORT, '0.0.0.0')
  } catch (e) {
    console.error(e)
  }
}

start().catch(console.error)
