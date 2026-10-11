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
- TURNSTILE_SECRET: required server-side secret for signup/resend
- TURNSTILE_SITE_KEY: public site key provided to signup UI by `/api/crown/signup-config`
- RESEND_API_KEY: transactional-email provider API key (Worker secret)
- CROWN_EMAIL_FROM: verified sender on an authorized domain (Worker configuration)
- CROWN_PUBLIC_ORIGIN: full HTTPS origin for confirmation emails (Preview origin during testing)

## Routes
- POST /api/crown/auth
- GET /api/crown/signup-config
- POST /api/crown/enroll
- POST /api/crown/resend-verification
- POST /api/crown/verify-email
- GET /api/crown/health
- GET /join/x (short X-specific invitation redirected to /join/?ref=x-tha-god)
- GET /join/ (public signup UI)
- GET /verify/ (manual email-confirmation page)

## Data model
members -> crown_credentials -> member_access
members -> sessions
members -> access_events
members -> loyalty_accounts / loyalty_ledger
enrollment_requests holds pre-membership requests.

## PCK
PCK values are never stored. The Worker derives a one-way credential digest using a per-member random salt plus a server-side pepper. Before production launch, this implementation should receive a dedicated security review and load test.

## Enrollment
New member records start `pending` with no House access or active login. A verified sender uses Resend to deliver a one-time emailed confirmation URL. The raw 32-byte verification token is never stored in D1: only its peppered SHA-256 digest is stored in `enrollment_requests.verification_token`. A 24-hour expiry and one-time POST verification activates the member and grants only `crown-house` access.

Migration `0027_crown_email_verification.sql` adds the verification lifecycle, resend timing, and immutable signup referral attribution. Legacy existing Preview identities are not deactivated or rewritten. New signups fail closed if migration, verified sending domain, Resend API key, Turnstile keys, or HTTPS public origin are unavailable.

Resend requires a verified sending domain and authorized sender. Cloudflare Turnstile verification is mandatory on both signup and resend; server-side Siteverify must succeed. Resend is limited to one replacement request per pending account every two minutes; tokens expire after 24 hours. Email confirmation uses an explicit button/POST to avoid mailbox scanners activating accounts by loading links.

**Deployment gate (Preview only):**
1. Apply migration 0027 in the existing `awe-crown-identity-preview` database, after migrations through 0026.
2. Configure `TURNSTILE_SECRET`, `TURNSTILE_SITE_KEY`, `RESEND_API_KEY`, `CROWN_EMAIL_FROM`, and `CROWN_PUBLIC_ORIGIN` in the correct Preview Worker environment. Never commit secret values.
3. Confirm `/api/crown/signup-config` returns `ready:true`; otherwise keep invitations closed.
4. Use a real inbox to signup, confirm no login prior to verification, confirm a 24-hour email arrives, press verification button, then confirm Crown login works.
5. Check expired/duplicate link rejection, resend delay, referral persistence and no access to other Houses.
6. Add a public privacy notice, anti-abuse operational limits, and any needed terms before external promotion.

Marketing consent is separate from transactional verification. Never use verification enrollment alone as permission to send promotions. Production/main/DNS must not change merely to activate Preview.

## Loyalty
Crowd/Crown/House units are internal loyalty units. The ledger is append-oriented; balances can be derived/audited against ledger entries.

## AWE 4 Kids
The schema marks AWE 4 Kids as a family audience. Child-directed enrollment, analytics, and identity flows must be implemented separately rather than reusing the adult member funnel unchanged.
