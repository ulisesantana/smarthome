export const generateSwaggerConfig = (
  docsHost = '0.0.0.0:3000',
  docsRoute = '/docs'
): { routePrefix: string, host: string, exposeRoute: boolean, swagger: { produces: string[], schemes: string[], info: { description: string, title: string, version: string }, consumes: string[] } } => ({
  swagger: {
    info: {
      title: 'Smart home API',
      description: 'API Rest for my home lights.',
      version: '0.1.0'
    },
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json']
  },
  host: docsHost,
  routePrefix: docsRoute,
  exposeRoute: true
})
