import { useEffect, useState, lazy, Suspense } from 'react'
import {
  ArrowDownToLine,
  ArrowRight,
  CheckCircle2,
  Clock,
  CloudUpload,
  Code2,
  Cpu,
  Database,
  Download,
  ExternalLink,
  FileArchive,
  FileCheck,
  FileText,
  Fingerprint,
  FolderGit2,
  HardDrive,
  Layers,
  LockKeyhole,
  QrCode,
  RefreshCw,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trash2,
  Upload,
  Zap,
} from 'lucide-react'
import HowItWorks3D from './HowItWorks3D'
import TiltCard from './TiltCard'

const Hero3DScene = lazy(() => import('./Hero3DScene'))

// Feature definitions for 3D tilt cards
const FEATURES = [
  {
    id: 'multi-file',
    title: 'Multiple File Uploads',
    tagline: 'Batch up to 100 MB',
    desc: 'Bundle multiple files under a single 6-character code. Images, presentations, spreadsheets or archives transfer seamlessly together.',
    icon: CloudUpload,
    color: '#3b82f6',
    meta: 'Up to 100 MB combined',
  },
  {
    id: 'password',
    title: 'Password Protection',
    tagline: 'Client-directed privacy',
    desc: 'Add an optional passphrase hashed server-side with bcrypt. The raw password is never stored, ensuring confidential documents remain private.',
    icon: LockKeyhole,
    color: '#8b5cf6',
    meta: 'Bcrypt hashing',
  },
  {
    id: 'expiry',
    title: 'Configurable Link Expiry',
    tagline: 'Ephemeral lifetime',
    desc: 'Choose how long files persist from 1 to 5 days. Once expired, shares are automatically wiped from disk with zero remnants.',
    icon: Clock,
    color: '#06b6d4',
    meta: '1 to 5 day windows',
  },
  {
    id: 'download-limits',
    title: 'Download Session Limits',
    tagline: 'Controlled distribution',
    desc: 'Restrict shares to a specific number of download sessions (1–5). Once the quota is reached, the share immediately deactivates.',
    icon: Download,
    color: '#10b981',
    meta: '1 to 5 download caps',
  },
  {
    id: 'qr-sharing',
    title: 'Instant QR Code Access',
    tagline: 'Camera-ready handoffs',
    desc: 'Every upload produces a high-resolution QR code encoding the direct access link. Perfect for projecting onto meeting screens or phone transfers.',
    icon: QrCode,
    color: '#ec4899',
    meta: 'Instant scan & download',
  },
  {
    id: 'streaming',
    title: 'Streaming Storage & Downloads',
    tagline: 'Constant memory profile',
    desc: 'Uploads and downloads stream asynchronously in memory-safe chunks via aiofiles. Server RAM stays constant regardless of file size.',
    icon: Zap,
    color: '#f59e0b',
    meta: 'Low-latency chunking',
  },
  {
    id: 'cleanup',
    title: 'Automated Cleanup Task',
    tagline: 'Zero orphaned files',
    desc: 'A background scheduler actively scans the database and filesystem, permanently purging expired shares and freeing storage automatically.',
    icon: Trash2,
    color: '#6366f1',
    meta: 'Hourly background sweeper',
  },
]

// Tech stack components
const TECH_STACK = [
  {
    name: 'React 19',
    role: 'Frontend Interface',
    desc: 'Concurrent React architecture powering responsive states, accessible modals, and sleek glass interactions.',
    badge: 'v19.0',
    color: '#61dafb',
    icon: Code2,
  },
  {
    name: 'Vite 6',
    role: 'Frontend Tooling',
    desc: 'Blazing-fast modern bundler providing lightning hot-module reloading and optimized production chunks.',
    badge: 'v6.0',
    color: '#bd34fe',
    icon: Zap,
  },
  {
    name: 'Python 3.11+',
    role: 'Backend Runtime',
    desc: 'Asynchronous event loop runtime powering clean concurrency with aiofiles and native async/await syntax.',
    badge: 'Python 3.11+',
    color: '#3776ab',
    icon: Terminal,
  },
  {
    name: 'FastAPI',
    role: 'REST API Framework',
    desc: 'High-performance async web framework with automatic OpenAPI documentation and strict Pydantic type validation.',
    badge: 'High Perf',
    color: '#009688',
    icon: Server,
  },
  {
    name: 'SQLModel',
    role: 'Database Modeling',
    desc: 'Elegant union of SQLAlchemy and Pydantic providing unified database schemas, migrations, and model validation.',
    badge: 'SQLAlchemy + Pydantic',
    color: '#d71f00',
    icon: Database,
  },
  {
    name: 'SQLite (dev) / PostgreSQL (prod)',
    role: 'Relational Persistence',
    desc: 'Zero-config aiosqlite for local development with a seamless pluggable abstraction ready for PostgreSQL in production.',
    badge: 'Async Persistence',
    color: '#003b57',
    icon: HardDrive,
  },
  {
    name: 'Redis',
    role: 'Session Token Cache',
    desc: 'In-memory data store managing atomic session tokens to prevent race conditions during concurrent download sessions.',
    badge: 'Atomic Tokens',
    color: '#dc382d',
    icon: Cpu,
  },
]

export default function AboutPage({ theme, onOpenModal, onGoHome }) {
  // Scroll to top on initial mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  return (
    <div className="about-page">
      {/* Background Ambients & Orbs */}
      <div className="about-orb about-orb-1" aria-hidden="true" />
      <div className="about-orb about-orb-2" aria-hidden="true" />
      <div className="about-orb about-orb-3" aria-hidden="true" />

      {/* 1. HERO SECTION */}
      <section className="about-hero-section">
        <div className="about-hero-content">
          <span className="hero-kicker">
            <Sparkles size={14} /> AN EPHEMERAL TRANSFER EXPERIENCE
          </span>
          <h1 className="about-hero-title">
            Sharing made simple.
          </h1>
          <p className="about-hero-subtitle">
            ShareLabs is a lightweight, temporary file-sharing portal engineered for the exact moment
            you just need to hand someone a file. Fast. Private. No accounts, no personal exposure, and no clutter.
          </p>
          <div className="about-hero-actions">
            <button
              type="button"
              className="button button-primary hero-cta-btn"
              onClick={() => onOpenModal('upload')}
            >
              <Upload size={17} /> Share files now
            </button>
            <a href="#how-it-works" className="button button-secondary hero-explore-btn">
              Explore how it works <ArrowRight size={16} />
            </a>
          </div>

          <div className="hero-stats-row">
            <div className="hero-stat-item">
              <strong>100 MB</strong>
              <span>Per share bundle</span>
            </div>
            <div className="stat-separator" />
            <div className="hero-stat-item">
              <strong>6 Chars</strong>
              <span>Simple share code</span>
            </div>
            <div className="stat-separator" />
            <div className="hero-stat-item">
              <strong>0 Sign-ups</strong>
              <span>Pure frictionless utility</span>
            </div>
          </div>
        </div>

        {/* 3D Hero Scene with Glass Materials, Floating Files, Sharing Arrows */}
        <div className="about-hero-3d">
          <Suspense fallback={
            <div className="hero-3d-wrapper" aria-hidden="true">
              <div className="hero-3d-canvas-container">
                <div className="hero-3d-fallback">
                  <div className="fallback-glass-card fallback-sender">
                    <span className="fallback-pill">Ready to send</span>
                    <div className="fallback-file-icon">📄</div>
                    <strong>presentation.pdf</strong>
                    <small>18.4 MB</small>
                  </div>
                  <div className="fallback-arrow">
                    <span className="fallback-stream-line" />
                    <span className="fallback-stream-badge">6-Char Token</span>
                  </div>
                  <div className="fallback-glass-card fallback-receiver">
                    <span className="fallback-pill">Instant pickup</span>
                    <div className="fallback-code-box">A8K2PX</div>
                    <small>No account required</small>
                  </div>
                </div>
              </div>
            </div>
          }>
            <Hero3DScene theme={theme} />
          </Suspense>
        </div>
      </section>

      {/* 2. HOW IT WORKS 3D STORYTELLING SEQUENCE */}
      <HowItWorks3D />

      {/* 3. ABOUT SHARELABS — THE AUTHENTIC STORY & PROBLEM */}
      <section className="about-story-section" id="story">
        <div className="section-head text-center">
          <span className="section-kicker">
            <ShieldCheck size={14} /> AUTHENTIC ORIGIN & PHILOSOPHY
          </span>
          <h2>Why ShareLabs Exists</h2>
          <p>
            Born from an everyday security disaster that should never have happened in the first place.
          </p>
        </div>

        <div className="story-grid">
          {/* Real Origin Card */}
          <TiltCard className="story-card origin-card" maxTilt={6}>
            <div className="story-card-inner">
              <div className="story-icon-header">
                <span className="story-badge warning">
                  <ShieldAlert size={15} /> The Smartboard Incident
                </span>
              </div>
              <h3>The moment of exposure</h3>
              <p>
                A friend once had to log into her personal WhatsApp on a shared college smartboard
                just to download a course presentation file. The moment she logged in, weeks of private messages,
                personal notifications, and photos were instantly projected in front of the entire lecture hall.
              </p>
              <p className="story-quote">
                “ShareLabs was created so that never has to happen to anyone again.”
              </p>
            </div>
          </TiltCard>

          {/* The Problem with Modern Tools */}
          <TiltCard className="story-card problem-card" maxTilt={6}>
            <div className="story-card-inner">
              <div className="story-icon-header">
                <span className="story-badge danger">
                  <Layers size={15} /> The Problem With Big Cloud Tools
                </span>
              </div>
              <h3>Unnecessary bloat & sign-up walls</h3>
              <p>
                Modern file sharing has become bloated. Services demand your email, force two-factor login
                on foreign hardware, bombard recipients with subscription upsells, and leave accounts permanently
                logged in on public libraries, university kiosks, or colleagues’ laptops.
              </p>
              <div className="problem-points">
                <span>❌ Forgetting to sign out of shared PCs</span>
                <span>❌ Exposing chat history to bystanders</span>
                <span>❌ Mandating account creation just to download 1 file</span>
              </div>
            </div>
          </TiltCard>

          {/* Philosophy: iLovePDF inspired */}
          <TiltCard className="story-card philosophy-card" maxTilt={6}>
            <div className="story-card-inner">
              <div className="story-icon-header">
                <span className="story-badge success">
                  <Zap size={15} /> The Frictionless Philosophy
                </span>
              </div>
              <h3>Visit. Do the work. Leave.</h3>
              <p>
                Inspired by single-purpose utility champions like <strong>iLovePDF</strong>:
                no marketing traps, no feature creep, and no data harvesting. You upload your file,
                receive a neat six-character code or QR code, hand it to the recipient, and walk away.
              </p>
              <div className="philosophy-points">
                <span>✨ 6-character code works on any screen in seconds</span>
                <span>✨ Built-in automatic file deletion on expiration</span>
                <span>✨ No persistent identity required</span>
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* 4. APPLICATION FEATURES WITH 3D GLASS CARDS */}
      <section className="about-features-section" id="features">
        <div className="section-head text-center">
          <span className="section-kicker">
            <Layers size={14} /> CORE CAPABILITIES
          </span>
          <h2>Engineered for Frictionless Sharing</h2>
          <p>
            Carefully crafted capabilities with translucent glass depth, responsive tilt, and zero clutter.
          </p>
        </div>

        <div className="features-grid">
          {FEATURES.map((feat) => {
            const Icon = feat.icon
            return (
              <TiltCard key={feat.id} className="feature-card" maxTilt={9}>
                <div className="feature-card-content">
                  <div className="feature-top">
                    <span
                      className="feature-icon"
                      style={{
                        color: feat.color,
                        background: `color-mix(in srgb, ${feat.color} 12%, transparent)`,
                        borderColor: `color-mix(in srgb, ${feat.color} 25%, transparent)`,
                      }}
                    >
                      <Icon size={24} strokeWidth={1.8} />
                    </span>
                    <span className="feature-pill">{feat.meta}</span>
                  </div>
                  <h3>{feat.title}</h3>
                  <p>{feat.desc}</p>
                </div>
              </TiltCard>
            )
          })}
        </div>
      </section>

      {/* 5. TECHNOLOGY STACK SECTION */}
      <section className="about-tech-section" id="tech-stack">
        <div className="section-head text-center">
          <span className="section-kicker">
            <Cpu size={14} /> ARCHITECTURE & ENGINEERING
          </span>
          <h2>The ShareLabs Tech Stack</h2>
          <p>
            A layered, modern architecture separating presentation, business logic, persistence, and caching.
          </p>
        </div>

        <div className="tech-grid">
          {TECH_STACK.map((tech) => {
            const Icon = tech.icon
            return (
              <TiltCard key={tech.name} className="tech-card" maxTilt={7}>
                <div className="tech-card-body">
                  <div className="tech-card-head">
                    <span className="tech-icon-frame" style={{ color: tech.color }}>
                      <Icon size={22} />
                    </span>
                    <div className="tech-titles">
                      <strong>{tech.name}</strong>
                      <small>{tech.role}</small>
                    </div>
                  </div>
                  <p>{tech.desc}</p>
                  <div className="tech-badge-row">
                    <span className="tech-badge">{tech.badge}</span>
                  </div>
                </div>
              </TiltCard>
            )
          })}
        </div>

        {/* Layered Architectural Flow Diagram */}
        <div className="arch-flow-card">
          <div className="arch-flow-head">
            <span className="eyebrow">MODULAR SYSTEM ARCHITECTURE</span>
            <h3>Layered Clean Architecture</h3>
            <p>
              FastAPI routes dispatch business logic to services, wired via dependency injection,
              with persistence and file storage abstracted for frictionless scalability.
            </p>
          </div>
          <div className="arch-steps-chain">
            <div className="arch-step">
              <span className="arch-step-icon"><Code2 size={20} /></span>
              <strong>React 19 SPA</strong>
              <small>Glassmorphism & Modals</small>
            </div>
            <div className="arch-arrow"><ArrowRight size={16} /></div>
            <div className="arch-step">
              <span className="arch-step-icon"><Server size={20} /></span>
              <strong>FastAPI REST</strong>
              <small>Async Routers & DI</small>
            </div>
            <div className="arch-arrow"><ArrowRight size={16} /></div>
            <div className="arch-step">
              <span className="arch-step-icon"><Cpu size={20} /></span>
              <strong>Redis Tokens</strong>
              <small>Race-Condition Safe</small>
            </div>
            <div className="arch-arrow"><ArrowRight size={16} /></div>
            <div className="arch-step">
              <span className="arch-step-icon"><Database size={20} /></span>
              <strong>SQLModel & SQLite</strong>
              <small>PostgreSQL in Prod</small>
            </div>
            <div className="arch-arrow"><ArrowRight size={16} /></div>
            <div className="arch-step">
              <span className="arch-step-icon"><HardDrive size={20} /></span>
              <strong>Storage Layer</strong>
              <small>Local disk / R2 cloud</small>
            </div>
          </div>
        </div>
      </section>

      {/* 6. OPEN COLLABORATION — GITHUB SECTION */}
      <section className="about-collab-section" id="github">
        <div className="section-head text-center">
          <span className="section-kicker">
            <FolderGit2 size={14} /> OPEN COLLABORATION
          </span>
          <h2>Let's build something better, together.</h2>
          <p className="collab-lead-desc">
            ShareLabs is an evolving project built around simplicity, experimentation and collaboration.
            Developers are welcome to explore the source code, suggest improvements, report issues and contribute to its development.
          </p>
        </div>

        <TiltCard className="collab-glass-card" maxTilt={5}>
          <div className="collab-card-grid">
            <div className="collab-main-info">
              <div className="collab-repo-badge">
                <svg className="github-svg-icon" viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <div>
                  <span className="repo-org">amit8487 /</span>
                  <strong className="repo-name">ShareLabs</strong>
                </div>
              </div>
              <p className="repo-desc">
                An open-source, temporary file-sharing ecosystem combining Python, FastAPI, SQLModel,
                Redis, and React. Clean code architecture crafted for developers who care about code clarity and utility.
              </p>
              <div className="collab-actions">
                <a
                  href="https://github.com/amit8487/ShareLabs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button-primary github-explore-btn"
                  aria-label="Explore ShareLabs on GitHub (opens in a new tab)"
                >
                  <svg className="btn-gh-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  Explore on GitHub <ExternalLink size={15} />
                </a>
              </div>
            </div>

            <div className="collab-pillars">
              <span className="pillars-kicker">WAYS TO CONTRIBUTE</span>
              <ul className="pillars-list">
                <li>
                  <Sparkles size={16} className="pillar-icon" />
                  <div>
                    <strong>Feature suggestions</strong>
                    <small>Propose new ideas, flows, or storage capabilities.</small>
                  </div>
                </li>
                <li>
                  <ShieldCheck size={16} className="pillar-icon" />
                  <div>
                    <strong>Bug reports</strong>
                    <small>Identify edge cases, performance bottlenecks, or race conditions.</small>
                  </div>
                </li>
                <li>
                  <FolderGit2 size={16} className="pillar-icon" />
                  <div>
                    <strong>Pull requests</strong>
                    <small>Write clean tests, implement planned endpoints, or optimize services.</small>
                  </div>
                </li>
                <li>
                  <Layers size={16} className="pillar-icon" />
                  <div>
                    <strong>UI/UX improvements</strong>
                    <small>Refine animations, accessibility, touch gestures, and typography.</small>
                  </div>
                </li>
                <li>
                  <Zap size={16} className="pillar-icon" />
                  <div>
                    <strong>New ideas and experimentation</strong>
                    <small>Experiment with end-to-end encryption or WebRTC peer streaming.</small>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </TiltCard>
      </section>

      {/* 7. FINAL CALL TO ACTION */}
      <section className="about-cta-section">
        <div className="cta-glass-box">
          <div className="cta-ambient-glow" aria-hidden="true" />
          <span className="hero-kicker">
            <Sparkles size={14} /> INSTANT HANDOFF
          </span>
          <h2>Ready to share something?</h2>
          <p>
            Drop your files, grab your six-character code, and transfer without personal accounts or clutter.
          </p>
          <div className="cta-actions">
            <button
              type="button"
              className="button button-primary cta-btn-upload"
              onClick={() => onOpenModal('upload')}
            >
              <CloudUpload size={18} /> Upload files
            </button>
            <button
              type="button"
              className="button button-secondary cta-btn-download"
              onClick={() => onOpenModal('download')}
            >
              <ArrowDownToLine size={18} /> Download with code
            </button>
          </div>
          <div className="cta-subnotes">
            <span><ShieldCheck size={14} /> No accounts needed</span>
            <span><LockKeyhole size={14} /> Optional password</span>
            <span><Clock size={14} /> Automatic expiration</span>
          </div>
        </div>
      </section>
    </div>
  )
}
