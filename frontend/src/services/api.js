const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')
const CONNECTION_ERROR = 'Could not connect to QuickShare. Check that the API is running.'

function detailMessage(detail, status) {
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((item) => item.msg || JSON.stringify(item)).join(', ')
  return `Request failed (${status})`
}

function createApiError(status, detail) {
  const message = detailMessage(detail, status)
  const error = new Error(message)
  error.status = status
  error.detail = message
  return error
}

async function readError(response) {
  const payload = await response.json().catch(() => null)
  return createApiError(response.status, payload?.detail)
}

export function apiUrl(path) {
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
}

export function uploadFiles({ files, password, expiryDays, downloadLimit, onProgress, onRequest }) {
  return new Promise((resolve, reject) => {
    const form = new FormData()
    files.forEach((file) => form.append('files', file, file.name))
    if (password) form.append('password_hash', password)
    form.append('expiry_days', String(expiryDays))
    form.append('download_limit', String(downloadLimit))

    const xhr = new XMLHttpRequest()
    xhr.open('POST', apiUrl('/share/upload/'))
    xhr.timeout = 5 * 60 * 1000
    xhr.setRequestHeader('Accept', 'application/json')
    onRequest?.(xhr)

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100))
    })
    xhr.addEventListener('load', () => {
      let payload = null
      try { payload = JSON.parse(xhr.responseText) } catch { /* response may be empty */ }
      if (xhr.status >= 200 && xhr.status < 300) resolve(payload)
      else reject(createApiError(xhr.status, payload?.detail || `Upload failed (${xhr.status})`))
    })
    xhr.addEventListener('error', () => reject(createApiError(0, CONNECTION_ERROR)))
    xhr.addEventListener('timeout', () => reject(createApiError(0, 'The upload took too long. Please try again.')))
    xhr.addEventListener('abort', () => reject(createApiError(0, 'Upload cancelled.')))
    xhr.send(form)
  })
}

export async function getShareInfo(code, password = '') {
  const headers = { Accept: 'application/json' }
  if (password) headers['x-share-password'] = password
  let response
  try {
    response = await fetch(apiUrl(`/share/${encodeURIComponent(code)}`), { headers })
  } catch (error) {
    if (error instanceof TypeError) throw createApiError(0, CONNECTION_ERROR)
    throw error
  }
  if (!response.ok) throw await readError(response)
  return response.json()
}

export async function downloadSharedFile({ code, fileId, sessionToken, filename }) {
  let response
  try {
    response = await fetch(apiUrl(`/share/${encodeURIComponent(code)}/files/${encodeURIComponent(fileId)}`), {
      headers: { 'x-session-token': sessionToken },
    })
  } catch (error) {
    if (error instanceof TypeError) throw createApiError(0, CONNECTION_ERROR)
    throw error
  }
  if (!response.ok) throw await readError(response)

  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = filename || 'quickshare-download'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000)
}

export function qrImageUrl(code) {
  return apiUrl(`/share/${encodeURIComponent(code)}/qr`)
}

export function getApiBase() {
  return API_BASE
}
