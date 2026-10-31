# ShareLabs React frontend

A responsive React + Vite frontend for the existing ShareLabs FastAPI API. The home screen offers two focused actions (Upload and Download); each opens in a centred, iOS-inspired Light Liquid Glass modal instead of navigating to a separate page.

## Features

- Light and dark themes (preference is saved in the browser).
- Drag-and-drop and multi-file selection.
- Combined 100 MB client-side size check, matching the default backend limit.
- Optional password, expiry (1/2/3/5 days), and download limit (1/2/3/5).
- Upload progress using `XMLHttpRequest` upload events.
- Local previews for image, PDF, and text files before uploading.
- Share-success screen with six-character code, copyable link, backend-generated QR image, expiry, and file list.
- Recipient flow for code + optional password, session-token authorization, and individual file downloads.
- Minimal three-view experience: homepage, Upload glass modal, and Download glass modal.
- iOS-inspired Light Liquid Glass panels with milky transparency, saturated backdrop blur, thin reflections, soft depth, and rounded corners.
- Smooth spring-like scale/lift popup entrance and fade/scale exit animations; respects `prefers-reduced-motion`.
- Responsive modal sizing: approximately 55% viewport width on desktop and near full-screen on mobile.
- Responsive layout and a persistent light/dark toggle.

## Requirements

- Node.js 20.19+ or 22.12+ recommended.
- The ShareLabs FastAPI backend running at `http://127.0.0.1:8000` by default.
- Redis running, because the existing backend uses Redis for download-session tokens.

## Run the frontend

From this directory:

```bash
npm install
```

Copy `.env.example` to `.env` (PowerShell: `Copy-Item .env.example .env`; Command Prompt: `copy .env.example .env`) and set the API URL if your backend is not using the default:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Start Vite:

```bash
npm run dev
```

Open <http://localhost:5173>.

## Run the backend

In a separate terminal, from the repository root:

```bash
python -m venv venv
```

Windows PowerShell:

```powershell
venv\Scripts\Activate.ps1
```

macOS / Linux:

```bash
source venv/bin/activate
```

Install and run:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Make sure Redis is running at the URL configured in `app/core/redis_client.py` before starting the API.

## API integration map

| Frontend action | FastAPI request |
|---|---|
| Upload | `POST /share/upload/` |
| Resolve code / verify password | `GET /share/{code}` with optional `x-share-password` header |
| Download a file | `GET /share/{code}/files/{file_id}` with `x-session-token` header |
| Render QR code | `GET /share/{code}/qr` |

The upload request sends repeated multipart `files` fields and form fields named `password_hash`, `expiry_days`, and `download_limit`, matching the current router. Despite its name, `password_hash` is the plaintext password field accepted by the API; the backend hashes it before storing it. The frontend does not hash it itself.

The share-info response's `session_token` is kept in React state and sent as `x-session-token` for each file download. The token is short-lived (20 minutes in the current backend). If it expires, the recipient should resolve the share code again. The backend download flow was also adjusted so one authorized session can download the remaining files in a multi-file share even when its first file consumes the last allowed session slot.

## Backend integration settings

The backend's `app/main.py` now enables CORS for:

- `http://localhost:5173`
- `http://127.0.0.1:5173`
- The origin configured by `FRONTEND_URL`

The backend default `FRONTEND_URL` was changed to `http://localhost:5173`, so its QR endpoint generates a link to the Vite frontend during local development. The root `.env.example` documents this setting. For deployment, set `FRONTEND_URL` to the exact public React site origin (no trailing slash), for example `https://sharelabs.example.com`.

In production, also set `VITE_API_BASE_URL` at frontend build time to the public FastAPI API origin, and configure `FRONTEND_URL` on the backend to the public frontend origin. Ensure the API is served over HTTPS when the frontend is HTTPS.

## Homepage and modal interaction

The homepage intentionally stays simple: it presents only the Upload and Download actions. Clicking either action opens a glass panel over the existing home screen. The background is blurred and lightly washed with a translucent overlay; the panel uses a milky translucent surface, soft highlights, a thin luminous border, and a gentle floating shadow.

The popup enters with a short scale-and-lift animation that settles into place, and closes with a matching fade/scale animation. Press Escape or click the area outside the panel to close it. On smaller screens the panels expand to nearly the full viewport. The light theme is the primary Liquid Glass treatment; the theme toggle also provides a coordinated dark glass variation.

The upload success state remains inside the Upload panel. The recipient code/password form and file list remain inside the Download panel. File previews open above the glass panel so they remain visible.

## File previews

Previews are generated locally in the browser before upload for images, PDFs, and text-based files. This does not make a download request or consume a recipient download session. The recipient view downloads the shared file through the backend's authenticated streaming endpoint.

## Notes

- The UI offers expiry and download-limit values of 1, 2, 3, and 5, within the current backend validation range of 1–5.
- The upload size indicator checks the combined selected size against 100 MB, matching the backend's default `MAX_TOTAL_FILE_SIZE_MB`. If you change that backend setting, update `MAX_TOTAL_BYTES` in `src/utils/files.js` to keep the client hint aligned.
- No authentication or file-history dashboard was added because those features are not present in the current API.
