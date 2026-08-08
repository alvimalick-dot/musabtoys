# Production Readiness / DevSecOps Fixes

## Critical — DB backup exposure (github.com/alvimalick-dot/musabtoys)
- [ ] Back up local repo folder to a safe offline location (user)
- [x] Add `mongodb-backup/`, `*.bson`, `*.agg` to `.gitignore`
- [x] `git rm -r --cached mongodb-backup` + commit removal (commit message applied)
- [ ] Install `git-filter-repo`
- [ ] Purge `mongodb-backup` from all git history
- [ ] Force-push to origin (`git push origin --force --all`)
- [ ] Rotate ADMIN_JWT_SECRET, ADMIN_PASSWORD, DB connection string, API keys (user action — data was publicly exposed)

## Security
- [x] Fix SSRF: replace `hostname: "**"` with explicit allowlist in `next.config.ts`
- [x] Add minimal security headers (X-Frame-Options, HSTS, X-Content-Type-Options, Referrer-Policy) to `next.config.ts`
- [x] Add rate limiting to `/api/checkout` (IP-keyed, Upstash-backed)

## Config / Docs
- [x] Add `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` to `.env.example`
- [ ] Confirm Upstash Redis env vars are set in Vercel (user action)
- [ ] Document Sentry as a future task (deferred — keep deps lean); rely on Vercel function logs for now

## Verify
- [ ] `npx tsc --noEmit` for type errors
- [ ] `npm run build` for clean production build
