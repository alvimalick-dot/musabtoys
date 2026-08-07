# TODO — Functionality Gaps (priority order)

## Phase A — Admin orders tab (low-risk refactors) — DONE
- [x] `AdminPanel.tsx`: optimistic local update in `updateStatus()` with `loadOrders()` rollback on failure
- [x] `AdminPanel.tsx`: optimistic local update in `saveTracking()` with `loadOrders()` rollback on failure

## Phase B — Focus-refetch for stale admin tabs — DONE
- [x] `AdminPanel.tsx`: visibility-change refetch for orders tab (>30s hidden)
- [x] `CouponAdmin.tsx`: visibility-change refetch (>30s hidden)
- [x] `AdminAnalytics.tsx`: visibility-change refetch (>30s hidden)

## Phase C — Site-wide server-page refresh — DONE
- [x] `src/components/ui/RouterRefreshOnFocus.tsx` (new): `router.refresh()` when tab regains focus after >30s
- [x] `src/app/layout.tsx`: mount `<RouterRefreshOnFocus />` inside `<ThemeProvider>`

## Phase D — Stock alerts actually notify (email-only) — DONE
- [x] Make email **required** on stock-alert form + API schema (phone stays for dedup/reference)
- [x] `src/lib/stock-alerts.ts` (new): `notifyRestockAlerts()` — email customers, mark `notified: true`
- [x] `src/app/api/products/[id]/route.ts`: trigger restock alerts when stock goes `0 → >0`

## Phase E — "Order shipped" email (one-time) — DONE
- [x] `src/models/Order.ts`: add `shippedEmailSent?: boolean`
- [x] `src/components/emails/OrderShippedEmail.tsx` (new): react-email template
- [x] `src/lib/notify.ts`: add `buildShippedEmail()`
- [x] `src/app/api/orders/route.ts`: send once when status→shipped or tracking first set

## Verification
- [ ] `npx tsc --noEmit` passes


