import request, { CoreOptions, Response } from 'request'

function generateRequestHandler (method: string) {
  // eslint-disable-next-line
  return (url: string, options?: CoreOptions): Promise<Response> => new Promise((resolve, reject) => {
    request(
      url,
      {
        method,
        json: true,
        ...options
      },
      (err: Error, response: Response) => {
        if (err !== null) {
          return reject(err)
        }
        return resolve(response)
      }
    )
  })
}

export const http = {
  get: generateRequestHandler('GET'),
  post: generateRequestHandler('POST'),
  patch: generateRequestHandler('PATCH'),
  put: generateRequestHandler('PUT'),
  delete: generateRequestHandler('DELETE')
}

export default http
