# Morrow production identity setup

Morrow uses four owned services. Supabase is the identity and database boundary; Resend delivers authenticated email; Twilio Verify handles phone OTP; VAPID delivers web and installed-app push.

Never paste secret keys into chat, browser forms outside the provider dashboard, or variables prefixed with `NEXT_PUBLIC_`.

## 1. Production URL

Choose the final HTTPS address before testing email links and push notifications.

Set:

```env
NEXT_PUBLIC_SITE_URL="https://your-morrow-domain.example"
```

In Supabase, open **Authentication → URL Configuration**:

- Site URL: the production HTTPS address
- Redirect URLs: `http://localhost:3000/**` and the production address followed by `/**`

## 2. Supabase Auth

Open [Supabase Authentication](https://supabase.com/dashboard/project/_/auth/users).

Under **Authentication → Providers**:

- Enable Email
- Keep email confirmation enabled
- Disable anonymous sign-ins
- Allow email sign-up; Morrow places verified new accounts in owner approval before workspace access

Under **Authentication → Email Templates**, set the main link in each template:

Recovery:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/login?recovery=1">Reset password</a>
```

Invite:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/login?invite=1">Accept invitation</a>
```

Morrow verifies the token on the server, stores the Supabase session in secure cookies, and only activates a member whose request was approved.

## 3. Resend SMTP and operational email

Open [Resend Domains](https://resend.com/domains), add a domain you control, and add the provided SPF and DKIM records at its DNS provider. Wait until the domain shows **Verified**.

Open [Resend API Keys](https://resend.com/api-keys) and create a key named `Morrow Production`.

In Supabase, open **Authentication → Email → SMTP Settings** and use:

- Host: `smtp.resend.com`
- Port: `465`
- Username: `resend`
- Password: the Resend API key
- Sender name: `Morrow`
- Sender email: an address on the verified domain, such as `access@your-domain.example`

Also set these server-only Morrow variables for birthday alerts, digests, and operational mail:

```env
RESEND_API_KEY="re_..."
MORROW_EMAIL_FROM="Morrow <alerts@your-domain.example>"
```

## 4. Twilio Verify

Open [Twilio Verify Services](https://console.twilio.com/us1/develop/verify/services), create a service named `Morrow`, and enable SMS.

Set:

```env
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_VERIFY_SERVICE_SID="VA..."
```

For normal notification messages, also configure either a Messaging Service or a sending number:

```env
TWILIO_MESSAGING_SERVICE_SID="MG..."
# or
TWILIO_FROM_NUMBER="+1..."
```

Use international E.164 phone numbers in Morrow, for example `+234...`. A Twilio trial account can only send to numbers added and verified in Twilio.

## 5. Web and installed-app push

Generate one VAPID key pair and keep the private key on the server:

```bash
npx web-push generate-vapid-keys
```

Set:

```env
VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
VAPID_SUBJECT="mailto:security@your-domain.example"
```

Push requires HTTPS in production. On iPhone and iPad, the user must install Morrow to the Home Screen before granting web-push permission.

## 6. Vercel deployment

For an institutional deployment, choose a Vercel plan that permits that use; Hobby is limited to personal, non-commercial projects and its daily cron jobs can run anywhere within the scheduled hour. Supabase Free can pause after inactivity and does not provide downloadable database backups. Decide on the production plans and backup policy before inviting staff.

Import the repository as a Next.js project with the repository root as the Root Directory. The build script verifies required Production variables and generates the ignored Prisma client before building. Do not upload `.env` or `.env.local` to Git.

Set these environment variables in the Vercel **Production** environment before deploying:

```text
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
SUPABASE_DATABASE_URL
SUPABASE_DB_CA_CERT
VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
VAPID_SUBJECT
CRON_SECRET
RESEND_API_KEY
MORROW_EMAIL_FROM
```

Use the pooled Supabase Postgres connection for `SUPABASE_DATABASE_URL`. Download the database CA certificate from Supabase **Database Settings → SSL Configuration** and paste its PEM contents into the server-only `SUPABASE_DB_CA_CERT` variable; production database connections verify the certificate. Keep `SUPABASE_DIRECT_URL` available to the trusted migration runner, not the browser. Apply and verify the checked-in Postgres migrations before opening the site to users. `RESEND_API_KEY` and `MORROW_EMAIL_FROM` are required for Morrow's operational email alerts; add the Twilio variables from step 4 only if SMS is required. Supabase Auth SMTP is configured separately in the Supabase dashboard.

Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin, then update Supabase **Authentication → URL Configuration** with that Site URL and the exact `https://your-domain.example/auth/confirm` redirect. Keep `http://localhost:3000/**` only for local development. Supabase Auth handles sign-up, confirmation, and password recovery; the Morrow database handles approval and workspace access. There is no `MORROW_AUTH_PROVIDER` switch.

`vercel.json` registers two authenticated daily jobs: command sweep at **06:30 UTC** (07:30 Africa/Lagos) and pending-delivery retry at **07:30 UTC**. Set `CRON_SECRET` to a random secret of at least 16 characters; Vercel sends it as a bearer token. These are fixed UTC schedules: changing the in-app daily-brief time does not retime Vercel Cron. On Vercel Hobby, daily jobs may run at any time during their scheduled hour. Use a more precise scheduler if minute-accurate delivery is required.

## 7. Acceptance test

Complete these checks before launch:

1. Owner requests recovery and receives the email.
2. Recovery link opens Morrow and updates the password.
3. Owner signs in and signs out.
4. A new member requests access.
5. Owner approves the request; the member receives an invitation.
6. The member chooses a password and signs in with the assigned role.
7. Phone OTP arrives and rejects an incorrect code.
8. A test alert arrives by every enabled channel (email, SMS, and/or phone push).
9. Revoking a session signs that device out.
10. The Vercel Cron Jobs page shows successful runs for both jobs; a future-dated birthday generates an advance alert without a manual visit.
