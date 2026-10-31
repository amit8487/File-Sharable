import { useEffect, useRef, useState } from 'react'
import {
  ArrowDownToLine,
  ArrowRight,
  CheckCircle2,
  Clock,
  CloudUpload,
  Copy,
  Download,
  FileArchive,
  FileCheck,
  FileImage,
  FileText,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

const STAGES = [
  {
    id: 1,
    tag: 'STAGE 01',
    title: 'Upload your files',
    subtitle: 'Drag, drop or select multiple files up to 100 MB combined.',
    desc: 'Files are read and streamed in memory-safe chunks. No registration, no tracking cookies, and no account required.',
    icon: CloudUpload,
    pillColor: '#3b82f6',
  },
  {
    id: 2,
    tag: 'STAGE 02',
    title: 'Generate code & QR',
    subtitle: 'Instant 6-character token with optional bcrypt password and expiry.',
    desc: 'ShareLabs creates an ephemeral link, a human-readable 6-character code, and a camera-ready QR code for physical handoffs.',
    icon: KeyRound,
    pillColor: '#8b5cf6',
  },
  {
    id: 3,
    tag: 'STAGE 03',
    title: 'Download on any device',
    subtitle: 'Fast streaming download with atomic session tracking.',
    desc: 'Enter the code or scan the QR on a friend’s computer, phone, or college smartboard. Files stream directly without exposing personal accounts.',
    icon: ArrowDownToLine,
    pillColor: '#10b981',
  },
]

export default function HowItWorks3D() {
  const [activeStage, setActiveStage] = useState(1)
  const containerRef = useRef(null)
  const [manualOverride, setManualOverride] = useState(false)
  const manualTimerRef = useRef(null)

  // Scroll-driven progression
  useEffect(() => {
    const handleScroll = () => {
      if (manualOverride || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight

      // Calculate progress of this section through the viewport
      const totalDist = rect.height + windowHeight * 0.4
      const currentPos = windowHeight * 0.7 - rect.top
      const progress = Math.max(0, Math.min(1, currentPos / totalDist))

      if (progress < 0.38) {
        setActiveStage(1)
      } else if (progress < 0.72) {
        setActiveStage(2)
      } else {
        setActiveStage(3)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [manualOverride])

  const selectStage = (stageId) => {
    setActiveStage(stageId)
    setManualOverride(true)
    clearTimeout(manualTimerRef.current)
    manualTimerRef.current = setTimeout(() => {
      setManualOverride(false)
    }, 4500)
  }

  return (
    <section ref={containerRef} className="how-it-works-section" id="how-it-works">
      <div className="section-head text-center">
        <span className="section-kicker">
          <Sparkles size={14} /> 3D STORYTELLING SEQUENCE
        </span>
        <h2>How ShareLabs Works</h2>
        <p>
          A three-stage ephemeral pipeline engineered for speed, privacy, and zero footprint.
          Watch the files move as you scroll.
        </p>
      </div>

      {/* Stage Stepper Tabs */}
      <div className="how-stepper" role="tablist" aria-label="How it works stages">
        {STAGES.map((s) => {
          const Icon = s.icon
          const isActive = activeStage === s.id
          return (
            <button
              key={s.id}
              role="tab"
              aria-selected={isActive}
              className={`how-step-btn ${isActive ? 'is-active' : ''}`}
              onClick={() => selectStage(s.id)}
            >
              <span className="step-num">{s.id}</span>
              <span className="step-label">
                <strong>{s.title}</strong>
                <small>{s.tag}</small>
              </span>
              <Icon size={18} className="step-icon" />
            </button>
          )
        })}
      </div>

      {/* 3D Interactive Stage Canvas */}
      <div className="how-3d-stage">
        {/* Dynamic 3D Connected Perspective Visualizer */}
        <div className={`how-stage-viewport stage-active-${activeStage}`}>
          {/* Ambient Glows */}
          <div className="stage-glow stage-glow-cyan" />
          <div className="stage-glow stage-glow-violet" />

          {/* Perspective 3D Container */}
          <div className="stage-3d-world">
            {/* STAGE 1: UPLOAD VAULT */}
            <div className={`stage-card-3d stage-upload-card ${activeStage === 1 ? 'is-visible' : 'is-faded'}`}>
              <div className="stage-card-glass">
                <div className="stage-card-header">
                  <div className="card-badge"><CloudUpload size={16} /> Stage 01 · Ingestion</div>
                  <span className="capacity-pill">3 Files · 42.6 MB / 100 MB</span>
                </div>

                <div className="upload-file-cluster">
                  <div className="floating-file-item file-item-pdf">
                    <div className="file-icon-box"><FileText size={20} /></div>
                    <div className="file-meta">
                      <strong>Quarterly_Report.pdf</strong>
                      <small>14.2 MB · Ready</small>
                    </div>
                    <span className="file-badge success"><CheckCircle2 size={13} /></span>
                  </div>

                  <div className="floating-file-item file-item-zip">
                    <div className="file-icon-box"><FileArchive size={20} /></div>
                    <div className="file-meta">
                      <strong>Design_Assets.zip</strong>
                      <small>26.1 MB · Ready</small>
                    </div>
                    <span className="file-badge success"><CheckCircle2 size={13} /></span>
                  </div>

                  <div className="floating-file-item file-item-img">
                    <div className="file-icon-box"><FileImage size={20} /></div>
                    <div className="file-meta">
                      <strong>Diagram_v2.png</strong>
                      <small>2.3 MB · Ready</small>
                    </div>
                    <span className="file-badge success"><CheckCircle2 size={13} /></span>
                  </div>
                </div>

                <div className="stage-footer-note">
                  <span><ShieldCheck size={13} /> Zero registration required</span>
                  <span><RefreshCw size={13} /> Memory-safe streaming</span>
                </div>
              </div>
            </div>

            {/* STAGE 2: GENERATE CODE & QR */}
            <div className={`stage-card-3d stage-code-card ${activeStage === 2 ? 'is-visible' : 'is-faded'}`}>
              <div className="stage-card-glass">
                <div className="stage-card-header">
                  <div className="card-badge"><KeyRound size={16} /> Stage 02 · Cryptographic Token</div>
                  <span className="capacity-pill"><LockKeyhole size={12} /> bcrypt secured</span>
                </div>

                <div className="code-qr-display-grid">
                  <div className="share-code-box-3d">
                    <span className="box-kicker">YOUR EPHEMERAL CODE</span>
                    <div className="code-letters-row">
                      <span>A</span>
                      <span>8</span>
                      <span>K</span>
                      <span>2</span>
                      <span>P</span>
                      <span>X</span>
                    </div>
                    <div className="code-action-pill">
                      <Copy size={13} /> Share code copied
                    </div>
                  </div>

                  <div className="qr-prism-3d">
                    <div className="qr-prism-frame">
                      <QrCode size={78} strokeWidth={1.5} />
                      <div className="qr-scan-line" />
                    </div>
                    <span className="qr-label">Scan to transfer</span>
                  </div>
                </div>

                <div className="stage-meta-strip">
                  <div className="meta-pill"><Clock size={13} /> Expires in 2 days</div>
                  <div className="meta-pill"><Download size={13} /> 5 download sessions</div>
                  <div className="meta-pill"><Fingerprint size={13} /> Redis session token</div>
                </div>
              </div>
            </div>

            {/* STAGE 3: DOWNLOAD & PICKUP */}
            <div className={`stage-card-3d stage-download-card ${activeStage === 3 ? 'is-visible' : 'is-faded'}`}>
              <div className="stage-card-glass">
                <div className="stage-card-header">
                  <div className="card-badge"><ArrowDownToLine size={16} /> Stage 03 · Safe Recipient Delivery</div>
                  <span className="capacity-pill success">Verified · 3 Files</span>
                </div>

                <div className="recipient-stream-preview">
                  <div className="device-screen-bezel">
                    <div className="screen-header">
                      <span className="dot dot-red" />
                      <span className="dot dot-yellow" />
                      <span className="dot dot-green" />
                      <span className="screen-url">sharelabs.internal/?code=A8K2PX</span>
                    </div>

                    <div className="download-row-preview">
                      <div className="file-icon-box"><FileCheck size={18} /></div>
                      <div className="file-meta">
                        <strong>Quarterly_Report.pdf</strong>
                        <small>14.2 MB · Direct stream</small>
                      </div>
                      <span className="download-btn-pill"><Download size={13} /> Save</span>
                    </div>

                    <div className="download-row-preview">
                      <div className="file-icon-box"><FileCheck size={18} /></div>
                      <div className="file-meta">
                        <strong>Design_Assets.zip</strong>
                        <small>26.1 MB · Direct stream</small>
                      </div>
                      <span className="download-btn-pill"><Download size={13} /> Save</span>
                    </div>
                  </div>
                </div>

                <div className="stage-footer-note">
                  <span><ShieldCheck size={13} /> No personal WhatsApp/login exposed</span>
                  <span><RefreshCw size={13} /> Auto-deleted on expiry</span>
                </div>
              </div>
            </div>

            {/* Dynamic Stage Pipeline Indicator */}
            <div className="stage-pipeline-line">
              <div className={`pipeline-point pt-1 ${activeStage >= 1 ? 'is-done' : ''}`} />
              <div className={`pipeline-connect conn-1 ${activeStage >= 2 ? 'is-filled' : ''}`} />
              <div className={`pipeline-point pt-2 ${activeStage >= 2 ? 'is-done' : ''}`} />
              <div className={`pipeline-connect conn-2 ${activeStage >= 3 ? 'is-filled' : ''}`} />
              <div className={`pipeline-point pt-3 ${activeStage >= 3 ? 'is-done' : ''}`} />
            </div>
          </div>
        </div>

        {/* Narrative Description Box */}
        <div className="how-narrative-card">
          <div className="narrative-tag">
            <span className="narrative-num">{STAGES[activeStage - 1].tag}</span>
            <span className="narrative-badge">{activeStage} of 3</span>
          </div>
          <h3>{STAGES[activeStage - 1].title}</h3>
          <p className="narrative-lead">{STAGES[activeStage - 1].subtitle}</p>
          <p className="narrative-detail">{STAGES[activeStage - 1].desc}</p>

          <div className="narrative-actions">
            {activeStage > 1 && (
              <button
                type="button"
                className="narrative-btn prev"
                onClick={() => selectStage(activeStage - 1)}
              >
                Previous Stage
              </button>
            )}
            {activeStage < 3 && (
              <button
                type="button"
                className="narrative-btn next"
                onClick={() => selectStage(activeStage + 1)}
              >
                Next Stage <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
