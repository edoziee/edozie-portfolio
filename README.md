# Edozie Ezeanolue — Portfolio

Personal portfolio site for Edozie Ezeanolue, AI Operations Architect.

## Live Site

https://edozie.dev

## Project Structure

- `public/index.html` — Deployed landing page (includes intake form)
- `public/case/` — Password-protected case study pages
- `supabase/functions/` — Supabase Edge Functions
- `edozie_landingv1.html` — Landing page source (v1, archived)

## Intake Form & Email Notifications

The site has a multi-step intake form (Typeform-style) that collects lead info and stores it in Supabase.

### Stack

- **Frontend**: Vanilla HTML/CSS/JS (static, deployed on Vercel)
- **Database**: Supabase (project: `zczisljqxykiigujheac`)
- **Email notifications**: [Resend](https://resend.com) via Supabase Edge Function

### How it works

1. User completes the 11-step intake form on the site
2. Form data is POSTed to the `submit-lead` Supabase Edge Function (saves to DB)
3. A second fire-and-forget call hits `notify-lead` Edge Function, which sends a formatted email via Resend to the configured notification address

### Edge Functions

| Function | Purpose |
|----------|---------|
| `submit-lead` | Saves form submission to Supabase database |
| `notify-lead` | Sends email notification via Resend with all submission details |

### Supabase Secrets Required

| Secret | Description |
|--------|-------------|
| `RESEND_API_KEY` | API key from [resend.com](https://resend.com) |
| `NOTIFICATION_EMAIL` | Email address that receives lead notifications (currently `edozie18@gmail.com`) |

### Domain Setup

- `edozie.dev` domain is verified in Resend for sending from `notifications@edozie.dev`
- DNS managed through Vercel
