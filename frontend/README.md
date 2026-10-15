# ARC frontend

Next.js App Router with TypeScript, Tailwind CSS and ESLint. Dependencies are
locked in `package-lock.json`; install them with `npm ci`.

```sh
npm run dev
```

Open [localhost:3000](http://localhost:3000). `app/page.tsx` loads the three-pane
workspace. `components/` contains the tool stream, graph and review panel;
`lib/` contains the event reducer and API/SSE lifecycle. Clicking Investigate
creates a real backend run using configured provider credits. Merely opening or
refreshing the page does not create a run. Existing sessions replay from memory.

Set `NEXT_PUBLIC_API_URL` in `.env.local` to override `http://localhost:8000`.
Start the MCP and FastAPI processes using the commands in the root README.
The UI shows failed requests and requires a real answer for each human question.
It supports inspecting captured raw output, cancellation, and keyboard node selection.

Use `npm run lint` and `npm run build` for local checks. `npm start` serves the
production build. Provider credentials belong in the backend's ignored `.env`,
never in browser code or `NEXT_PUBLIC_*` variables.

On October 14, 2026, `npm audit` reported five high-severity entries along one
development dependency chain: `eslint-config-next` → `@next/eslint-plugin-next`
→ `fast-glob` → `micromatch` → `braces`. The
[advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) concerns deeply nested
glob patterns. npm's suggested fix downgrades the Next.js ESLint configuration
to 14.2.35, so no automatic force-fix was applied. Recheck upstream for a
compatible patched release.
`npm audit --omit=dev` reported zero production dependency vulnerabilities.

The updated workspace passed ESLint, TypeScript, offline event-reducer checks and
the Next.js production build on October 14, 2026. An elevated build succeeded;
an earlier scaffold build had been blocked by the environment's worker-port rules.
The complete Claude/provider workflow has not been invoked during implementation.
An isolated Chrome check also passed at desktop and mobile widths with no runtime
exceptions or initial backend requests. The local preview processes were stopped.

See the [root README](../README.md) for the backend and event contract.
