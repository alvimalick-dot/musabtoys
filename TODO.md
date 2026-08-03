# Resolve Amazon Q Security Scan Findings

## Steps

- [ ] 1. Harden `src/app/api/auth/customer/request-otp/route.ts` — clarify SSRF finding (fetch URL is a hardcoded, trusted constant)
- [ ] 2. Harden `src/app/api/upload/route.ts` — add path-containment guard for local fallback write
- [ ] 3. Harden `src/lib/auth.ts` — document default-credential check + timing-safe padding rationale
- [ ] 4. Harden `src/lib/mongodb.ts` — clarify DNS/SSRF allowlist rationale
- [ ] 5. Fix `src/app/api/seed/route.ts` — reword "unprofessional language" sample copy
- [ ] 6. Run `npx tsc --noEmit` + `npm run lint` to verify
