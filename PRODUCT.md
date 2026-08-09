# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users span two tightly related groups:
- **Freelancers and Upwork-style applicants** who tailor proposals and documents daily under marketplace contact rules.
- **Traditional job seekers** applying to companies by email, company portals, and LinkedIn.

Both need one honest master profile that can be reshaped per job without inventing experience.

## Product Purpose

ResumeForge turns a saved professional profile into job-specific resumes and cover letters. Users paste a job description (and optional special notes), then generate ATS-friendly documents, download PDFs, chat about fit / client questions from their real profile, and keep history.

Success means: faster, more targeted applications that stay grounded in real experience — and fewer platform bans when contact stays Off for marketplaces.

## Positioning

Unlike generic AI resume writers that invent fluff, ResumeForge uses the user’s **stored profile as ground truth**, then tailor-orders and rephrases for one job. Differentiating mechanisms already shipped:
- Per-application **Special notes**
- **Upwork-safe (no contact)** resume mode
- Profile-grounded **Career chat** for client/Upwork screening answers
- Cover-letter **humanize / detect** tools
- Requirement match views on generations

## Operating Context

Browser app (React + Vite). Signed-in workflow: Profile → Generate (or Chat for notes/answers) → History/PDF. Used on phones between jobs and on desktop during focused application sessions. Marketplaces and ATS parsers are part of the user’s real environment.

## Capabilities and Constraints

Keep all current product features and flows; this redesign refreshes UI/UX systemically and upgrades marketing/auth/FAQ copy. Do not invent testimonials, fake metrics, customer logos, or capabilities the app does not have. Synthetic demo content on the landing page must be labeled where it could be mistaken for real user outcomes.

Confirmed surfaces: Home, FAQ, Login, Signup, Profile, Generate, Chat, History.

## Brand Commitments

- Name: **ResumeForge**
- User-selected energy: confident marketplace workspace with green action accents (Upwork-adjacent trust, more distinctive execution)
- Audience: freelancers first narrative, job seekers equally served in product messaging
- Existing logo asset paths under `frontend/public/`

## Evidence on Hand

- Working product UI under `frontend/src/`
- Feature set proven in-app (generate, chat, profile, history, PDF, humanize)
- No third-party testimonials or press on hand — do not fabricate

## Product Principles

1. Ground truth over inventiveness — profile and user notes beat marketing fiction.
2. Application-ready clarity — every marketing surface should point toward Profile → Generate (or Chat).
3. Marketplace-safe by design — contact modes and proposal context are first-class, not footnotes.
4. Mobile is a primary workplace, not a shrunken desktop.
5. Professional confidence without AI-slop aesthetics.
