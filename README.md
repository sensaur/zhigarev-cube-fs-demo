# EU Retail Sales — demo app

**Ilia Zhigarev** — demo for the [Full-Stack Engineer](https://www.careers-page.com/cube-dev/job/63X78V5R) role at [Cube](https://cube.dev).

Sales table and charts (REST), a live map (WebSocket), and an AI chat that answers questions about stored HTTP request logs (Claude). Stack: React, Express, Prisma, PostgreSQL — pnpm workspaces, Turborepo.

**Live app:** [zhigarev-cube-fs-demo.vercel.app](https://zhigarev-cube-fs-demo.vercel.app/)

Use the in-app navigation to explore.

## Tech stack

- React 19 + TypeScript
- Zustand
- Virtualized tables (TanStack Virtual)
- Recharts (sales REST API)
- Live map — WebSocket + react-simple-maps
- AI chat — Claude on request logs *(no Cube.js in this repo)*
- Chat: multiple threads, DB history, auto titles
- Express, Prisma, PostgreSQL

## Local setup

See [.env.example](.env.example) for `DATABASE_URL`, `CORS_ORIGIN`, `VITE_API_URL`, `VITE_WS_URL`, and optional `ANTHROPIC_API_KEY`.

Root scripts: `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm typecheck`; database: `pnpm db:migrate` / `pnpm db:push` as needed.
