# CareerPilot

CareerPilot is a responsive AI career companion for planning a career path, practicing interviews, improving resume content, and building portfolio projects.

## Run locally

1. Install dependencies with `npm install`.
2. Copy `backend/.env.example` to `backend/.env`. Set `AI_API_KEY` to enable provider responses; leave it blank to use the included mock responses.
3. In one terminal, run `npm run server` to start the Express API on port 3001.
4. In another terminal, run `npm run dev` and open the Vite URL shown in the terminal.

Vite proxies `/api` requests to the local Express server. For a separate frontend host, set `VITE_API_URL` to the API origin before building.

## API

- `POST /api/chat` — message plus recent history
- `POST /api/interview` — evaluate an interview response
- `POST /api/resume` — improve a resume statement
- `POST /api/roadmap` — generate a career roadmap
- `POST /api/project` — generate a portfolio project
- `POST /api/recommendation` — recommend a next skill
- `GET /api/health` — health check

AI provider configuration stays on the backend. The browser uses speech recognition where available and optional browser text-to-speech.
