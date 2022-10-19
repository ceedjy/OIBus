const url = require('url')

const fetch = require('node-fetch')
const ProxyAgent = require('proxy-agent')

const BaseRequest = require('./BaseRequest.class')

const { generateFormDataBodyFromFile } = require('../utils')

class FetchRequest extends BaseRequest {
  /**
   * Send the request using node-fetch
   * If "headers" contains Content-Type "data" is sent as string in the body.
   * If "headers" doesn't contain Content-Type "data" is interpreted as a path and sent as a file.
   * @param {string} requestUrl - The URL to send the request to
   * @param {string} method - The request type
   * @param {object} headers - The headers
   * @param {object} proxy - Proxy to use
   * @param {string} data - The body or file to send
   * @param {number} timeout - The request timeout
   * @return {Promise} - The status sent
   */
  async sendImplementation(requestUrl, method, headers, proxy, data, timeout) {
    this.logger.trace('sendWithFetch() called')

    let agent = null

    if (proxy) {
      const { protocol, host, port, username = null, password = null } = proxy

      const proxyOptions = url.parse(`${protocol}://${host}:${port}`)

      if (username && password) {
        proxyOptions.auth = `${username}:${await this.engine.encryptionService.decryptText(password)}`
      }

      agent = new ProxyAgent(proxyOptions)
    }

    let body
    if (Object.prototype.hasOwnProperty.call(headers, 'Content-Type')) {
      body = data
    } else {
      body = generateFormDataBodyFromFile(data)

      const formHeaders = body.getHeaders()
      Object.keys(formHeaders).forEach((key) => {
        headers[key] = formHeaders[key]
      })
    }

    const fetchOptions = {
      method,
      headers,
      body,
      agent,
      timeout,
    }

    let response
    try {
      response = await fetch(requestUrl, fetchOptions)
    } catch (error) {
      const requestError = error
      requestError.responseError = false
      throw requestError
    }
    if (!response.ok) {
      const responseError = new Error(response.statusText)
      responseError.responseError = true
      responseError.statusCode = response.status
      throw responseError
    }
  }
}

module.exports = FetchRequest
