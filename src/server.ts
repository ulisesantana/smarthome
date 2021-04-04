import 'reflect-metadata'
import fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify'
import dotenv from 'dotenv'
import { generateSwaggerConfig, fastifyDevelopmentOptions, fastifyProductionOptions } from './config'
import { lightRoutes } from './light'
import { roomRoutes } from './room'
import { AppBootstrap } from './app.bootstrap'
import { container } from 'tsyringe'
import { Environment } from './common'
import { sceneRoutes } from './scene'

type ServerOptions = RouteShorthandOptions & {
    docsHost?: string,
    docsRoute?: string
}

export async function buildServer (options: ServerOptions = {
  docsHost: '127.0.0.1:8080',
  docsRoute: '/docs'
}): Promise<FastifyInstance> {
  const server = prepareServerBasedOnEnvironment(options)
  await container.resolve(AppBootstrap).exec()

  lightRoutes(server)
  roomRoutes(server)
  sceneRoutes(server)

  return server
}

function prepareServerBasedOnEnvironment (options: ServerOptions): FastifyInstance {
  const environment = new Environment()
  if (environment.isTest()) {
    dotenv.config()
    return fastify({
      ...options,
      disableRequestLogging: true
    })
  }
  if (environment.isDevelopment()) {
    dotenv.config()
    const server = fastify({
      ...options,
      ...fastifyDevelopmentOptions
    })
    server.register(import('fastify-cors'))
    server.register(import('fastify-swagger'), generateSwaggerConfig(options.docsHost, options.docsRoute))
    console.log(`Check ${options.docsRoute} for SwaggerUI.`)

    return server
  }
  return fastify({ ...options, ...fastifyProductionOptions })
}
