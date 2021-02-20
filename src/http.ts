import request, { CoreOptions, Response } from 'request'

function generateRequest (method: string) {
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
  get: generateRequest('GET'),
  post: generateRequest('POST'),
  patch: generateRequest('PATCH'),
  put: generateRequest('PUT'),
  delete: generateRequest('DELETE')
}

export default http
