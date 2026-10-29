<div align="center">

# ⚡ QuickShare

### Share files instantly. No accounts. No exposure. Just a code.

<br/>

![Status](https://img.shields.io/badge/status-in%20development-F5A623?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-3B82F6?style=for-the-badge)
![Python](https://img.shields.io/badge/python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Redis](https://img.shields.io/badge/cache-Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

<br/>

[About](#-about) · [Features](#-features) · [How it works](#how-it-works) · [Tech stack](#tech-stack) · [Roadmap](#roadmap) · [Run locally](#-run-locally)

</div>

---

## 📖 About

**QuickShare** is a lightweight file-sharing tool for the moment you just need to hand someone a file. Fast. Without logging into a personal account on a shared device, without exposing your private stuff, and without all the bloat modern file-sharing services pile on.

### 💡 Why I built this

A friend once had to log into their personal WhatsApp on a shared college smartboard just to download a presentation, and ended up exposing their private chats to the whole class. QuickShare exists so that never has to happen again.

**Upload a file → get a short code (and a QR code) → the other person enters it → they download. Done.**

It's inspired by tools like **iLovePDF**: visit, do the work, leave. No sign-up walls, no feature creep, no data harvesting.

| 🧑‍💻 Guests | 👤 Registered users *(planned)* |
| :--- | :--- |
| Up to **100 MB** per share | Longer expiry windows |
| Optional **password protection** | Higher limits |
| Expiry of **2–5 days** | Device tracking |
| Configurable **download limits** | Same frictionless core experience |

> [!NOTE]
> **Project status:** The **backend API is complete and working**. The **frontend UI is currently in development** (HTML + CSS + Vanilla JS). Until it ships, you can try everything through the built-in API docs.
---

## ✨ Features

### ✅ Implemented

| | Feature | What it does |
| :-: | :--- | :--- |
| 📤 | **Upload with unique code** | Upload one or more files in a single request and get a short, human-friendly 6-character code |
| 📦 | **Multi-file shares** | Batch multiple files (up to 100 MB combined) under one share code |
| 🧩 | **Streaming storage** | Files are read and written in chunks, so memory usage stays constant even for big uploads |
| 🗄️ | **Metadata persistence** | Share and file metadata live in async SQLite, while the actual bytes sit in a separate storage layer |
| 🔐 | **Password protection** | Optional, hashed with bcrypt. The plain password is never stored |
| ⚡ | **Redis session tokens** | Prevents race conditions and accurately tracks unique download sessions |
| 🧹 | **Automated cleanup** | Background task deletes expired shares and orphaned files from disk |
| ⏳ | **Configurable expiry** | Set an expiration window per share |
| 📥 | **Download limits** | Cap how many times a share can be downloaded |
| 🧱 | **Pluggable storage** | Local filesystem today, Cloudflare R2 tomorrow, with minimal changes |
| ⚙️ | **Centralized config** | Pydantic `BaseSettings` with `.env` support and cached access |
| 🧵 | **Dependency injection** | Session, storage and service instances wired through FastAPI's DI system |

### 🔜 Planned

- 👤 Optional user registration and login with JWT auth
- 📊 Device access tracking and device caps for logged-in users
- 🖥️ Minimal frontend (HTML + CSS + Vanilla JS) for upload and download
- ☁️ Cloudflare R2 storage backend for production
- 🐘 PostgreSQL support for production
- 🌐 Public deployment

---

<a id="how-it-works"></a>

## 🔄 How it works

```mermaid
flowchart LR
    A["📤 Upload file(s)"] --> B["🔑 Get 6-char code<br/>+ QR code"]
    B --> C["📨 Share the code"]
    C --> D["⌨️ Recipient enters code<br/>or scans QR"]
    D --> E{"🔐 Password set?"}
    E -->|Yes| F["Enter password"]
    E -->|No| G["📥 Streaming download"]
    F --> G
    G --> H["⏳ Share expires after time<br/>or download limit"]
    H --> I["🧹 Background cleanup<br/>removes it"]
```

### 🏗️ Architecture

The backend is layered, so routing, business logic, storage and persistence don't leak into each other.

```mermaid
flowchart TD
    Client["🌐 Client"] -->|HTTP| API["🛣️ FastAPI routes"]
    API --> Services["🧠 Services<br/>business logic"]
    Services --> Redis[("⚡ Redis<br/>session tokens")]
    Services --> DB[("🗄️ SQLite<br/>metadata · PostgreSQL in prod")]
    Services --> Storage["📁 Local storage<br/>Cloudflare R2 in prod"]
    Cleanup["🧹 Background cleanup task"] -.-> DB
    Cleanup -.-> Storage

    style Client fill:#e0f2f1,stroke:#009688,color:#004d40
    style API fill:#e3f2fd,stroke:#1e88e5,color:#0d47a1
    style Services fill:#fff3e0,stroke:#fb8c00,color:#e65100
    style Redis fill:#ffebee,stroke:#d32f2f,color:#b71c1c
    style DB fill:#fce4ec,stroke:#d81b60,color:#880e4f
    style Storage fill:#f3e5f5,stroke:#8e24aa,color:#4a148c
    style Cleanup fill:#f5f5f5,stroke:#757575,color:#212121
```

---

<a id="tech-stack"></a>

## 🛠️ Tech stack

<div align="center">

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLModel-D71F00?style=flat-square&logo=sqlalchemy&logoColor=white)
![Pydantic](https://img.shields.io/badge/Pydantic-E92063?style=flat-square&logo=pydantic&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare_R2-F38020?style=flat-square&logo=cloudflare&logoColor=white)
<!-- ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=flat-square&logo=javascript&logoColor=black) -->

</div>

| Layer | Technology |
| :--- | :--- |
| **Backend** | FastAPI |
| **ORM / Models** | SQLModel (SQLAlchemy + Pydantic) |
| **Database** | SQLite (dev) → PostgreSQL (prod) |
| **Cache / Sessions** | Redis (session tokens, race-condition protection) |
| **File storage** | Local filesystem (dev) → Cloudflare R2 (prod) |
| **Async runtime** | `asyncio`, `aiosqlite`, `aiofiles` |
| **Config** | `pydantic-settings` |
| **Security** | `bcrypt` |
| **API docs** | Scalar / OpenAPI |
| **Frontend** | Plain HTML + CSS + Vanilla JS *(planned)* |
| **Hosting** | Render / Railway (backend), Vercel (frontend) *(planned)* |

<details>
<summary><b>🧠 Concepts I practiced building this</b></summary>

<br/>

- **REST API design** with resource-oriented endpoints and proper HTTP status codes
- **Async-first architecture** using `async`/`await` across database, storage and route layers
- **Dependency injection** for sessions, storage and services: reusable, testable, swappable
- **Layered architecture** separating routing, business logic (services), storage and persistence
- **Storage abstraction** that isolates filesystem concerns from application logic
- **Schema-driven validation** with Pydantic models for requests and responses
- **Configuration as code** with `BaseSettings`, environment variables and cached settings
- **Streaming I/O** for uploading and (planned) downloading large files without loading them fully into memory
- **Transactional persistence** with SQLAlchemy sessions and relationship-driven inserts
- **Hashed credentials** with bcrypt, so sensitive data is never stored in plaintext

</details>

---

<a id="roadmap"></a>

## 🗺️ Roadmap

| Phase | Focus | Status |
| :-: | :--- | :-: |
| **1** | Core backend: upload, codes, multi-file shares, streaming storage, bcrypt passwords, expiry, download limits | ✅ Done |
| **2** | Download flow: streaming endpoint, password verification, QR codes | ✅ Done |
| **3** | Cleanup: background task for expired shares and orphaned files | ✅ Done |
| **4** | Frontend: upload and download pages in HTML + CSS + Vanilla JS | 🔨 In progress |
| **5** | Accounts: optional registration, JWT auth, device tracking and caps | 📋 Planned |
| **6** | Production: Cloudflare R2, PostgreSQL, public deployment | 📋 Planned |

---

## 📸 Screenshots

> _Coming soon: a sneak peek of the upload flow via the API docs._

| Upload form | Response |
| :---: | :---: |
| `[Insert Screenshot Link Here]` | `[Insert Screenshot Link Here]` |

---

## 🧪 Run locally

There's no public deployment yet, so running it locally is currently the only way to try QuickShare. If you want to poke around the code or contribute, this is for you.

### Prerequisites

- **Python 3.11+**
- **Git**
- **Redis**, running locally, via WSL, or via Docker (see below)
- *(Optional)* `sqlite3` CLI for inspecting the database
- *(Optional)* A modern code editor like VS Code

### 🔴 Start Redis first

QuickShare needs a running Redis instance. Pick whichever option fits your setup:

<details>
<summary><b>🐳 Docker (works everywhere)</b></summary>

<br/>

```bash
docker run -d --name quickshare-redis -p 6379:6379 redis:7
```

</details>

<details>
<summary><b>🪟 Windows via WSL</b></summary>

<br/>

```bash
sudo apt update && sudo apt install redis-server
sudo service redis-server start
```

</details>

<details>
<summary><b>🍎 macOS / 🐧 Linux (native)</b></summary>

<br/>

```bash
# macOS (Homebrew)
brew install redis
brew services start redis

# Debian / Ubuntu
sudo apt install redis-server
sudo systemctl start redis-server
```

</details>

Check that it's up:

```bash
redis-cli ping
# PONG
```

### Setup

**1. Clone the repo**

```bash
git clone https://github.com/<your-username>/quickshare.git
cd quickshare
```

**2. Create and activate a virtual environment**

```bash
python -m venv venv
```

```bash
# Windows (PowerShell)
venv\Scripts\Activate.ps1

# macOS / Linux
source venv/bin/activate
```

**3. Install dependencies**

```bash
pip install -r requirements.txt
```

**4. Set up environment variables**

Copy the example file and tweak values as needed. Check it for the Redis connection settings, and make sure they match wherever your Redis is running (a default local install listens on `localhost:6379`).

```bash
cp .env.example .env
```

**5. Start the dev server**

```bash
uvicorn app.main:app --reload
```

> [!TIP]
> Once the server is running, open the built-in API docs in your browser and try an upload straight from there. No frontend needed.
---

## 📄 License

Released under the [MIT License](LICENSE).

<div align="center">

<br/>

⚡ **Visit. Share. Leave.** ⚡

<sub><a href="#-quickshare">⬆ Back to top</a></sub>

</div>