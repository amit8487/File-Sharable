export const MAX_TOTAL_BYTES = 100 * 1024 * 1024

export function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let index = 0
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024
    index += 1
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[index]}`
}

export function getFileKind(file) {
  const type = file?.type || ''
  const name = file?.name || file?.filename || ''
  const extension = name.split('.').pop()?.toLowerCase() || ''
  if (type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension)) return 'image'
  if (type === 'application/pdf' || extension === 'pdf') return 'pdf'
  if (type.startsWith('video/') || ['mp4', 'mov', 'webm'].includes(extension)) return 'video'
  if (type.startsWith('audio/') || ['mp3', 'wav', 'ogg'].includes(extension)) return 'audio'
  if (type.startsWith('text/') || ['txt', 'md', 'json', 'csv', 'py', 'js', 'jsx', 'html', 'css', 'xml'].includes(extension)) return 'text'
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return 'archive'
  return 'file'
}

export function formatDate(dateString) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}
