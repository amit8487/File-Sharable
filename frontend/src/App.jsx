import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDownToLine, ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronDown,
  Clipboard, CloudUpload, Copy, Download, File as FileIcon, FileArchive,
  FileAudio, FileImage, FileText, FileVideo, Fingerprint, HardDrive,
  KeyRound, LockKeyhole, Moon, QrCode, RefreshCw, ShieldCheck,
  Sparkles, Sun, Trash2, Upload, X,
} from 'lucide-react'
import { downloadSharedFile, getShareInfo, qrImageUrl, uploadFiles } from './services/api'
import { formatBytes, formatDate, getFileKind, MAX_TOTAL_BYTES } from './utils/files'

const EXPIRY_OPTIONS = [1, 2, 3, 5]
const DOWNLOAD_OPTIONS = [1, 2, 3, 5]

function makeId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function FileGlyph({ file, size = 19 }) {
  const kind = getFileKind(file)
  const props = { size, strokeWidth: 1.8 }
  if (kind === 'image') return <FileImage {...props} />
  if (kind === 'pdf' || kind === 'text') return <FileText {...props} />
  if (kind === 'video') return <FileVideo {...props} />
  if (kind === 'audio') return <FileAudio {...props} />
  if (kind === 'archive') return <FileArchive {...props} />
  return <FileIcon {...props} />
}

function ThemeButton({ theme, onToggle }) {
  const isDark = theme === 'dark'
  return (
    <button className="icon-button theme-button" onClick={onToggle} aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`} title={`Switch to ${isDark ? 'light' : 'dark'} theme`}>
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  )
}

function Header({ theme, onToggleTheme, onHome }) {
  return (
    <header className="topbar home-topbar">
      <button className="brand brand-home" onClick={onHome} aria-label="ShareLabs home">
        <span className="brand-mark"><img src="/ShareLabs-icon-192.png" alt="" width="34" height="34" /></span>
        <span>Share<span>Labs</span></span>
      </button>
      <div className="topbar-actions">
        <span className="secure-label"><ShieldCheck size={14} /> Private by design</span>
        <ThemeButton theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  )
}

function DropZone({ onFiles, disabled }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const handleFiles = (list) => {
    if (!disabled && list?.length) onFiles(Array.from(list))
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div
      className={`dropzone ${dragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
      onDragEnter={(event) => { event.preventDefault(); if (!disabled) setDragging(true) }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false) }}
      onDrop={(event) => { event.preventDefault(); setDragging(false); handleFiles(event.dataTransfer.files) }}
      onClick={(event) => { if (!disabled && event.target !== inputRef.current) inputRef.current?.click() }}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(event) => { if (!disabled && (event.key === 'Enter' || event.key === ' ')) inputRef.current?.click() }}
      aria-label="Choose or drop files to upload"
    >
      <input ref={inputRef} type="file" multiple hidden onChange={(event) => handleFiles(event.target.files)} disabled={disabled} />
      <div className="drop-icon"><CloudUpload size={27} strokeWidth={1.8} /></div>
      <div className="drop-copy">
        <strong>Drop your files here</strong>
        <span>or <button type="button" className="text-button" onClick={(event) => { event.stopPropagation(); inputRef.current?.click() }}>browse files</button> from your device</span>
      </div>
      <span className="drop-hint">Up to 100 MB per share <i /> Any file type</span>
    </div>
  )
}

function PreviewModal({ item, onClose }) {
  const [textContent, setTextContent] = useState('Loading preview…')
  const [previewUrl, setPreviewUrl] = useState('')
  const kind = getFileKind(item?.file)

  useEffect(() => {
    if (!item?.file) return undefined
    const url = URL.createObjectURL(item.file)
    setPreviewUrl(url)
    if (kind === 'text') {
      item.file.text().then(setTextContent).catch(() => setTextContent('This file could not be previewed.'))
    }
    return () => URL.revokeObjectURL(url)
  }, [item, kind])

  if (!item) return null
  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="preview-modal" role="dialog" aria-modal="true" aria-label={`Preview ${item.file.name}`}>
        <div className="modal-header">
          <div className="modal-file-title"><span className="file-icon"><FileGlyph file={item.file} /></span><div><strong>{item.file.name}</strong><small>{formatBytes(item.file.size)}</small></div></div>
          <button className="icon-button" onClick={onClose} aria-label="Close preview"><X size={18} /></button>
        </div>
        <div className="preview-stage">
          {kind === 'image' && <img src={previewUrl} alt={item.file.name} className="image-preview" />}
          {kind === 'pdf' && <iframe src={previewUrl} title={`Preview of ${item.file.name}`} className="pdf-preview" />}
          {kind === 'text' && <pre className="text-preview">{textContent}</pre>}
          {!['image', 'pdf', 'text'].includes(kind) && <div className="preview-unavailable"><FileGlyph file={item.file} size={34} /><strong>Preview isn't available for this file type</strong><span>Your file will still be shared normally.</span></div>}
        </div>
      </section>
    </div>
  )
}

function SelectedFileRow({ item, onRemove, onPreview, disabled }) {
  const kind = getFileKind(item.file)
  const canPreview = ['image', 'pdf', 'text'].includes(kind)
  const thumbnail = useMemo(() => kind === 'image' ? URL.createObjectURL(item.file) : null, [kind, item.file])
  useEffect(() => () => { if (thumbnail) URL.revokeObjectURL(thumbnail) }, [thumbnail])
  return (
    <div className="file-row">
      <div className={`file-icon kind-${kind}`}>{thumbnail ? <img src={thumbnail} alt="" /> : <FileGlyph file={item.file} />}</div>
      <div className="file-details"><strong title={item.file.name}>{item.file.name}</strong><span>{formatBytes(item.file.size)}</span></div>
      <div className="file-row-actions">
        {canPreview && <button className="subtle-action" onClick={() => onPreview(item)} disabled={disabled}>Preview</button>}
        <button className="icon-button small-icon-button" onClick={() => onRemove(item.id)} disabled={disabled} aria-label={`Remove ${item.file.name}`}><Trash2 size={15} /></button>
      </div>
    </div>
  )
}

function SettingsPanel({ password, setPassword, expiryDays, setExpiryDays, downloadLimit, setDownloadLimit, disabled }) {
  const [showPassword, setShowPassword] = useState(false)
  return (
    <section className="settings-panel">
      <div className="settings-heading"><div><span className="eyebrow">YOUR SHARE</span><h3>Make it yours</h3></div><span className="settings-badge">Optional settings</span></div>
      <label className="field-label" htmlFor="share-password"><span><LockKeyhole size={15} /> Password protection</span><small>Extra layer of privacy</small></label>
      <div className="password-field">
        <input id="share-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Add a password (optional)" disabled={disabled} autoComplete="new-password" />
        <button type="button" className="show-password" onClick={() => setShowPassword((value) => !value)} disabled={disabled}>{showPassword ? 'Hide' : 'Show'}</button>
      </div>
      <div className="settings-grid">
        <div className="setting-control">
          <label className="field-label" htmlFor="expiry-days"><span><RefreshCw size={15} /> Link expires</span></label>
          <div className="select-wrap"><select id="expiry-days" value={expiryDays} onChange={(event) => setExpiryDays(Number(event.target.value))} disabled={disabled}>{EXPIRY_OPTIONS.map((days) => <option value={days} key={days}>{days} {days === 1 ? 'day' : 'days'}</option>)}</select><ChevronDown size={15} /></div>
        </div>
        <div className="setting-control">
          <label className="field-label" htmlFor="download-limit"><span><Download size={15} /> Download limit</span></label>
          <div className="select-wrap"><select id="download-limit" value={downloadLimit} onChange={(event) => setDownloadLimit(Number(event.target.value))} disabled={disabled}>{DOWNLOAD_OPTIONS.map((count) => <option value={count} key={count}>{count} {count === 1 ? 'session' : 'sessions'}</option>)}</select><ChevronDown size={15} /></div>
        </div>
      </div>
      <p className="settings-note"><ShieldCheck size={14} /> Passwords are hashed by the server. A download session counts once, even across multiple files.</p>
    </section>
  )
}

function UploadProgress({ progress, onCancel }) {
  return (
    <div className="upload-progress-card">
      <div className="progress-heading"><span><span className="spinner" /> Uploading your files</span><strong>{progress}%</strong></div>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
      <div className="progress-footer"><p>Keep this tab open while your files are on their way.</p><button type="button" onClick={onCancel}>Cancel upload</button></div>
    </div>
  )
}

function ShareSuccess({ result, onReset, notify }) {
  const [qrFailed, setQrFailed] = useState(false)
  const shareUrl = `${window.location.origin}/?code=${encodeURIComponent(result.code)}`
  const copy = async (value, message) => {
    try {
      await navigator.clipboard.writeText(value)
      notify(message)
    } catch {
      notify('Clipboard access was blocked by your browser.')
    }
  }
  return (
    <section className="success-card">
      <div className="success-top"><span className="success-icon"><Check size={22} /></span><span className="eyebrow">UPLOAD COMPLETE</span><h2>Your files are ready to travel.</h2><p>Share the code or let someone scan your QR. That's it.</p></div>
      <div className="share-result-grid">
        <div className="share-code-panel">
          <span className="eyebrow">YOUR SHARE CODE</span>
          <div className="share-code">{result.code}</div>
          <button className="button button-primary copy-code-button" onClick={() => copy(result.code, 'Share code copied')}><Copy size={16} /> Copy code</button>
          <button className="link-copy-button" onClick={() => copy(shareUrl, 'Share link copied')}><Clipboard size={15} /> Copy share link</button>
        </div>
        <div className="qr-panel">
          <span className="eyebrow">SCAN TO OPEN</span>
          {!qrFailed ? <img className="qr-image" src={qrImageUrl(result.code)} alt={`QR code for share ${result.code}`} onError={() => setQrFailed(true)} /> : <div className="qr-fallback"><QrCode size={36} /><span>QR code unavailable</span></div>}
          <a className="qr-download" href={qrImageUrl(result.code)} target="_blank" rel="noreferrer"><ArrowDownToLine size={14} /> Open QR image</a>
        </div>
      </div>
      <div className="share-meta-grid">
        <div className="share-meta-item"><RefreshCw size={16} /><span><small>Expires</small><strong>{formatDate(result.expires_at)}</strong></span></div>
        <div className="share-meta-item"><Download size={16} /><span><small>Download limit</small><strong>{result.downloadLimit} {result.downloadLimit === 1 ? 'session' : 'sessions'}</strong></span></div>
        <div className="share-meta-item"><LockKeyhole size={16} /><span><small>Password</small><strong>{result.passwordProtected ? 'Protected' : 'Not required'}</strong></span></div>
      </div>
      <div className="success-files"><div className="success-files-heading"><strong>Shared files</strong><span>{result.files.length} {result.files.length === 1 ? 'file' : 'files'}</span></div>{result.files.map((file) => <div className="shared-file-row" key={file.file_id}><span className="file-icon"><FileGlyph file={file} /></span><span className="shared-file-name">{file.filename}</span><span className="shared-file-size">{formatBytes(file.size)}</span></div>)}</div>
      <button className="button button-secondary new-share-button" onClick={onReset}><Upload size={16} /> Create another share</button>
    </section>
  )
}

function ReceivePanel({ initialCode, notify }) {
  const [code, setCode] = useState(initialCode || '')
  const [password, setPassword] = useState('')
  const [share, setShare] = useState(null)
  const [sessionToken, setSessionToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [busyFile, setBusyFile] = useState('')
  const [error, setError] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)

  useEffect(() => { setCode(initialCode || '') }, [initialCode])

  async function lookupShare(event) {
    event.preventDefault()
    const normalizedCode = code.trim()
    if (!normalizedCode) { setError('Enter the six-character share code.'); return }
    setLoading(true)
    setError('')
    setShare(null)
    setSessionToken('')
    try {
      const data = await getShareInfo(normalizedCode, password)
      setShare(data)
      setSessionToken(data.session_token)
      setCode(data.code)
      setPassword('')
    } catch (err) {
      const message = err.message || 'Could not open this share.'
      // Map share lookup responses by HTTP status.
      if (err.status === 401) setError(password ? 'Incorrect password. Please try again.' : 'This share is password protected. Enter the password to continue.')
      else if (err.status === 404) setError('No share found for that code. Codes are case-sensitive.')
      else if (err.status === 410) setError('This share has expired or reached its download limit.')
      else if (err.status === 0) setError(message)
      else setError(message)
    } finally { setLoading(false) }
  }

  async function handleDownload(file) {
    setBusyFile(file.file_id)
    setError('')
    try {
      await downloadSharedFile({ code: share.code, fileId: file.file_id, sessionToken, filename: file.filename })
      notify(`${file.filename} is downloading`)
    } catch (err) {
      const message = err.message || 'Download failed.'
      // A download 401 requires opening the share again for a new session.
      if (err.status === 401) {
        const codeToKeep = code
        resetLookup()
        setCode(codeToKeep)
        setError('Your download session expired. Enter the password again if there is one, then open the share again.')
      } else if (err.status === 410) setError('The download limit for this share has been reached.')
      else if (err.status === 403 || err.status === 404) setError('This file is no longer available.')
      else if (err.status === 0) setError(message)
      else setError(message)
    } finally { setBusyFile('') }
  }

  function resetLookup() { setShare(null); setSessionToken(''); setPassword(''); setError('') }

  return (
    <div className="receive-card glass-receive-card">
      {!share ? <>
        <div className="receive-icon"><KeyRound size={23} /></div>
        <span className="eyebrow">RECEIVE FILES</span>
        <h2>Have a share code?</h2>
        <p className="receive-intro">Enter the code you got from the sender. Your files are just a step away.</p>
        <form onSubmit={lookupShare} className="receive-form">
          <label className="field-label" htmlFor="share-code-input">Share code</label>
          <input id="share-code-input" className="code-input" type="text" value={code} onChange={(event) => setCode(event.target.value)} placeholder="e.g. A8K2PX" maxLength={6} autoCapitalize="off" autoComplete="off" />
          <label className="field-label" htmlFor="recipient-password">Password <small>· only if the sender set one</small></label>
          <div className="password-field"><input id="recipient-password" type={passwordVisible ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter share password" autoComplete="off" /><button type="button" className="show-password" onClick={() => setPasswordVisible((value) => !value)}>{passwordVisible ? 'Hide' : 'Show'}</button></div>
          {error && <div className="inline-error"><ShieldCheck size={16} /> {error}</div>}
          <button className="button button-primary receive-submit" type="submit" disabled={loading}>{loading ? <><span className="spinner light" /> Checking share…</> : <>Open my files <ArrowRight size={16} /></>}</button>
        </form>
        <div className="privacy-note"><LockKeyhole size={14} /> Your files are only accessible with the share code.</div>
      </> : <>
        <div className="receive-success-head"><span className="success-icon"><Check size={20} /></span><div><span className="eyebrow">SHARE FOUND</span><h2>You're in.</h2><p>{share.files.length} {share.files.length === 1 ? 'file is' : 'files are'} ready to download.</p></div><button className="icon-button" onClick={resetLookup} title="Open another share"><ArrowLeft size={17} /></button></div>
        <div className="recipient-meta"><span><RefreshCw size={14} /> Expires {formatDate(share.expires_at)}</span><span><LockKeyhole size={14} /> {share.password_protected ? 'Password protected' : 'Open access'}</span></div>
        <div className="recipient-files">{share.files.map((file) => <div className="recipient-file" key={file.file_id}><span className="file-icon"><FileGlyph file={file} /></span><div className="file-details"><strong title={file.filename}>{file.filename}</strong><span>{formatBytes(file.size)}</span></div><button className="download-button" onClick={() => handleDownload(file)} disabled={Boolean(busyFile)} aria-label={`Download ${file.filename}`}>{busyFile === file.file_id ? <span className="spinner" /> : <Download size={16} />}</button></div>)}</div>
        {error && <div className="inline-error download-error"><ShieldCheck size={16} /> {error}</div>}
        <p className="session-note"><Fingerprint size={14} /> Downloads are securely authorized for this session.</p>
      </>}
    </div>
  )
}

function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return undefined
    const timer = window.setTimeout(onClose, 2800)
    return () => window.clearTimeout(timer)
  }, [message, onClose])
  if (!message) return null
  return <div className="toast"><CheckCircle2 size={16} /> {message}<button onClick={onClose} aria-label="Dismiss notification"><X size={14} /></button></div>
}

function GlassModal({ type, closing, onClose, children }) {
  const isUpload = type === 'upload'
  return (
    <div
      className={`glass-backdrop ${closing ? 'is-closing' : ''}`}
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}
    >
      <section
        className={`glass-modal glass-modal-${type} ${closing ? 'is-closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="glass-modal-title"
      >
        <div className="glass-modal-shine" aria-hidden="true" />
        <div className="glass-modal-head">
          <div className="glass-modal-heading">
            <span className="glass-modal-kicker">SHARELABS · {isUpload ? 'SEND SOMETHING' : 'PICK SOMETHING UP'}</span>
            <h2 id="glass-modal-title">{isUpload ? 'Upload files' : 'Download files'}</h2>
            <p>{isUpload ? 'Choose what to share, then make it yours.' : 'Enter your share code to access the files.'}</p>
          </div>
          <button className="icon-button glass-close" onClick={onClose} aria-label="Close window"><X size={18} /></button>
        </div>
        <div className="glass-modal-scroll">{children}</div>
      </section>
    </div>
  )
}

function HomeAction({ kind, onClick }) {
  const isUpload = kind === 'upload'
  return (
    <button className={`home-action home-action-${kind}`} onClick={onClick}>
      <span className="home-action-icon">{isUpload ? <CloudUpload size={27} strokeWidth={1.8} /> : <ArrowDownToLine size={27} strokeWidth={1.8} />}</span>
      <span className="home-action-copy">
        <strong>{isUpload ? 'Upload' : 'Download'}</strong>
        <small>{isUpload ? 'Share files with anyone' : 'Access files with a code'}</small>
      </span>
      <span className="home-action-arrow"><ArrowRight size={18} /></span>
    </button>
  )
}

function App() {
  const codeFromUrl = useMemo(() => new URLSearchParams(window.location.search).get('code') || '', [])
  const [theme, setTheme] = useState(() => localStorage.getItem('sharelabs-theme') || localStorage.getItem('quickshare-theme') || 'light')
  const [activeModal, setActiveModal] = useState(codeFromUrl ? 'download' : null)
  const [modalClosing, setModalClosing] = useState(false)
  const [files, setFiles] = useState([])
  const [password, setPassword] = useState('')
  const [expiryDays, setExpiryDays] = useState(2)
  const [downloadLimit, setDownloadLimit] = useState(5)
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [result, setResult] = useState(null)
  const [previewItem, setPreviewItem] = useState(null)
  const [toast, setToast] = useState('')
  const uploadRequest = useRef(null)
  const closeTimer = useRef(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('sharelabs-theme', theme)
  }, [theme])

  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  const totalSize = files.reduce((total, item) => total + item.file.size, 0)
  const canUpload = files.length > 0 && totalSize <= MAX_TOTAL_BYTES && !uploading
  const notify = (message) => setToast(message)

  function openModal(kind) {
    window.clearTimeout(closeTimer.current)
    setModalClosing(false)
    setActiveModal(kind)
  }

  function closeModal() {
    if (!activeModal || modalClosing) return
    setModalClosing(true)
    closeTimer.current = window.setTimeout(() => {
      setActiveModal(null)
      setModalClosing(false)
    }, 260)
  }

  useEffect(() => {
    if (!activeModal) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeModal()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [activeModal, modalClosing])

  function addFiles(incoming) {
    setUploadError('')
    const next = incoming.map((file) => ({ id: makeId(), file }))
    setFiles((current) => {
      const combined = [...current, ...next]
      return combined.filter((item, index, array) => array.findIndex((candidate) => candidate.file.name === item.file.name && candidate.file.size === item.file.size && candidate.file.lastModified === item.file.lastModified) === index)
    })
  }

  function removeFile(id) { setFiles((current) => current.filter((item) => item.id !== id)); setUploadError('') }

  async function startUpload() {
    if (!canUpload) return
    if (totalSize > MAX_TOTAL_BYTES) { setUploadError('The combined size of your files must be 100 MB or less.'); return }
    setUploading(true)
    setProgress(0)
    setUploadError('')
    try {
      const response = await uploadFiles({
        files: files.map((item) => item.file), password, expiryDays, downloadLimit,
        onProgress: setProgress,
        onRequest: (xhr) => { uploadRequest.current = xhr },
      })
      setProgress(100)
      setResult({ ...response, downloadLimit, passwordProtected: Boolean(password) })
    } catch (error) {
      // Keep upload validation details distinct from transport errors.
      if (error.status === 400) setUploadError(error.detail)
      else if (error.status === 422) setUploadError('Expiry and download limit must be between 1 and 5.')
      else if (error.status === 0) setUploadError(error.message)
      else setUploadError(error.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      uploadRequest.current = null
    }
  }

  function resetUpload() {
    setResult(null)
    setFiles([])
    setPassword('')
    setExpiryDays(2)
    setDownloadLimit(5)
    setProgress(0)
    setUploadError('')
  }

  function goHome() {
    if (!codeFromUrl) {
      const cleanUrl = `${window.location.pathname}${window.location.hash}`
      window.history.replaceState({}, '', cleanUrl)
    }
    closeModal()
  }

  const toggleTheme = () => setTheme((current) => current === 'dark' ? 'light' : 'dark')

  return (
    <div className="app-shell home-shell">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <div className="home-orb home-orb-one" /><div className="home-orb home-orb-two" />
      <div className="site-wrap home-site-wrap">
        <Header theme={theme} onToggleTheme={toggleTheme} onHome={goHome} />

        <main className="home-main">
          <section className="home-hero">
            <span className="hero-kicker"><Sparkles size={14} /> SIMPLE FILE TRANSFERS</span>
            <div className="home-brand-emblem"><span><img src="/ShareLabs-icon-192.png" alt="" width="72" height="72" /></span><i /><i /><i /></div>
            <h1>Share anything.<br /><span>Anywhere.</span></h1>
            <p>Move files between devices with one simple code.<br className="desktop-break" /> No account. No unnecessary steps.</p>
          </section>

          <section className="home-actions" aria-label="Choose what you want to do">
            <HomeAction kind="upload" onClick={() => openModal('upload')} />
            <HomeAction kind="download" onClick={() => openModal('download')} />
          </section>

          <div className="home-promises">
            <span><ShieldCheck size={15} /> Private by design</span>
            <i />
            <span><LockKeyhole size={14} /> Optional password</span>
            <i />
            <span><RefreshCw size={14} /> Links that expire</span>
          </div>
        </main>

        <footer className="footer home-footer">
          <span className="footer-brand"><span className="brand-mark small-brand"><img src="/ShareLabs-icon-192.png" alt="" width="20" height="20" /></span> ShareLabs</span>
          <span>Simple sharing, without the baggage.</span>
          <span className="footer-credit">Visit. Share. Leave.</span>
        </footer>
      </div>

      {activeModal && (
        <GlassModal type={activeModal} closing={modalClosing} onClose={closeModal}>
          {activeModal === 'upload' ? (
            result ? <div className="glass-upload-card glass-upload-success"><ShareSuccess result={result} onReset={resetUpload} notify={notify} /></div> : (
              <div className="upload-card glass-upload-card">
                <div className="card-heading"><div><span className="eyebrow">STEP 01 · START HERE</span><h2>What are we sharing?</h2><p>Add one file or a whole bundle. We'll keep them together.</p></div><span className="step-indicator">01 <i /> 03</span></div>
                <DropZone onFiles={addFiles} disabled={uploading} />
                {files.length > 0 && <div className="selected-files-section"><div className="selected-heading"><div><strong>Selected files</strong><span>{files.length} {files.length === 1 ? 'file' : 'files'}</span></div><button className="clear-button" onClick={() => setFiles([])} disabled={uploading}>Clear all</button></div><div className="selected-files-list">{files.map((item) => <SelectedFileRow key={item.id} item={item} onRemove={removeFile} onPreview={setPreviewItem} disabled={uploading} />)}</div><div className={`total-size ${totalSize > MAX_TOTAL_BYTES ? 'size-error' : ''}`}><span><HardDrive size={14} /> Total size</span><strong>{formatBytes(totalSize)} <em>/ 100 MB</em></strong></div></div>}
                {totalSize > MAX_TOTAL_BYTES && <div className="inline-error upload-error"><HardDrive size={16} /> The combined file size is over 100 MB. Remove one or more files to continue.</div>}
                {uploadError && <div className="inline-error upload-error"><ShieldCheck size={16} /> {uploadError}</div>}
                {uploading && <UploadProgress progress={progress} onCancel={() => uploadRequest.current?.abort()} />}
                <SettingsPanel password={password} setPassword={setPassword} expiryDays={expiryDays} setExpiryDays={setExpiryDays} downloadLimit={downloadLimit} setDownloadLimit={setDownloadLimit} disabled={uploading} />
                <div className="upload-action-area"><button className="button button-primary upload-button" onClick={startUpload} disabled={!canUpload}>{uploading ? <><span className="spinner light" /> Uploading…</> : <>Create share link <ArrowRight size={17} /></>}</button><p><LockKeyhole size={13} /> Your files are transferred securely. No account needed.</p></div>
              </div>
            )
          ) : (
            <ReceivePanel key="receive-panel" initialCode={codeFromUrl} notify={notify} />
          )}
        </GlassModal>
      )}

      <Toast message={toast} onClose={() => setToast('')} />
      <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
    </div>
  )
}

export default App
