# Applied Fixes (Automated)

- Pinned all core deps to stable, compatible versions (Next 14 + React 18 + Three 0.179 + R3F 9 + Tailwind 4).
- Removed unused frameworks by replacing dependency set with only imports actually used in the code.
- Added `engines.node = 22.x` and `packageManager = pnpm@10.4.0` for deterministic CI/Vercel builds.
- Mounted `ThemeProvider` in `app/layout.tsx` with `attribute="class"` and default dark theme.
- Deleted unused `styles/` directory (duplicate globals.css not referenced by App Router).
- Kept `next.config.mjs` lint/type guards disabled to avoid stopping builds during pinning (you can re-enable later).
- Kept `tw-animate-css` and removed `tailwindcss-animate` to avoid Tailwind v3 plugin mismatch.

## Install steps
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm run build

(optional) Re-enable strict lint/types in next.config.mjs after a clean build.

