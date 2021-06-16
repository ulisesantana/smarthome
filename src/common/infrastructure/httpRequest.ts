import request, { CoreOptions, Response } from 'request'

type HtppVerb = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

export class HttpRequest {
  get (url: string, options?: CoreOptions): Promise<Response> {
    return this.generateRequest('GET')(url, options)
  }

  post (url: string, options?: CoreOptions): Promise<Response> {
    return this.generateRequest('POST')(url, options)
  }

  patch (url: string, options?: CoreOptions): Promise<Response> {
    return this.generateRequest('PATCH')(url, options)
  }

  put (url: string, options?: CoreOptions): Promise<Response> {
    return this.generateRequest('PUT')(url, options)
  }

  delete (url: string, options?: CoreOptions): Promise<Response> {
    return this.generateRequest('DELETE')(url, options)
  }

  private generateRequest (method: HtppVerb): (url: string, options?: CoreOptions) => Promise<Response> {
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
}
