# Crown Identity v1

## Boundary
The Crown Door and Crown Circuit are discovery mechanics. They are not security controls.

Real entry begins at AW ID + PCK authentication. The browser never contains valid PCKs, member routing tables, or credential comparisons.

## Runtime
Cloudflare Worker + static assets + D1.

Required bindings/secrets:
- ASSETS: static asset binding
- CROWN_DB: D1 database
- PCK_PEPPER: Worker secret
- SESSION_PEPPER: Worker secret
- TURNSTILE_SECRET: Worker secret once Crown Enrollment is enabled
- TURNSTILE_SITE_KEY: public value for enrollment UI once enabled

## Routes
- POST /api/crown/auth
- POST /api/crown/enroll
- GET /api/crown/health

## Data model
members -> crown_credentials -> member_access
members -> sessions
members -> access_events
members -> loyalty_accounts / loyalty_ledger
enrollment_requests holds pre-membership requests.

## PCK
PCK values are never stored. The Worker derives a one-way credential digest using a per-member random salt plus a server-side pepper. Before production launch, this implementation should receive a dedicated security review and load test.

## Enrollment
Enrollment starts as pending. Email verification and PCK issuance are deliberately not faked in the browser. Turnstile must be validated server-side before accepting public enrollment.

## Loyalty
Crowd/Crown/House units are internal loyalty units. The ledger is append-oriented; balances can be derived/audited against ledger entries.

## AWE 4 Kids
The schema marks AWE 4 Kids as a family audience. Child-directed enrollment, analytics, and identity flows must be implemented separately rather than reusing the adult member funnel unchanged.
