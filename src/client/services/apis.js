const createErrorMessage = (response) => (
  `${response.status}${response.statusText ? ` - ${response.statusText}` : ''}`
)

const getRequest = async (uri) => {
  let text = ''
  try {
    const response = await fetch(uri, { method: 'GET' })
    if (response.status !== 200) {
      throw new Error(createErrorMessage(response))
    }
    text = await response.text()
    return JSON.parse(text)
  } catch (error) {
    console.error(`Request error for ${uri}:${error}`, text)
    throw new Error(error)
  }
}

const downloadFileRequest = async (uri) => {
  const link = document.createElement('a')
  link.href = uri
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const putRequest = async (uri, body) => {
  try {
    const response = await fetch(uri, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    if (response.status !== 200) {
      throw new Error(createErrorMessage(response))
    }
    return response
  } catch (error) {
    throw new Error(error)
  }
}

const getSouthProtocols = () => getRequest('/config/schemas/south')
const getNorthApis = () => getRequest('/config/schemas/north')
const getConfig = () => getRequest('/config')
const updateConfig = (body) => putRequest('/config', body)
const getActiveConfig = () => getRequest('/config/active')
const updateActiveConfig = () => putRequest('/config/activate')
const resetModifiedConfig = () => putRequest('/config/reset')
const exportAllPoints = (dataSourceId) => downloadFileRequest(`/config/south/${dataSourceId}/points/export`)

const getLogs = (fromDate, toDate, verbosity) => getRequest(`/logs?fromDate=${fromDate || ''}&toDate=${toDate || ''}&verbosity=[${verbosity}]`)
const getStatus = () => getRequest('/status')

export default {
  getSouthProtocols,
  getNorthApis,
  getConfig,
  getActiveConfig,
  updateActiveConfig,
  resetModifiedConfig,
  updateConfig,
  exportAllPoints,
  getLogs,
  getStatus,
}
