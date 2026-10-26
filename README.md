# MS Sofa Repair & Furnishing

Premium lead-generation website for MS Sofa Repair & Furnishing in Greater Noida West.

The site is a single-page React experience with GSAP scroll choreography, an enquiry form, WhatsApp contact, and a serverless email endpoint for Vercel.

## Local development

```bash
npm install
npm run dev
```

Open the local Vite URL printed in the terminal.

## Email delivery (not live until configured)

The enquiry form posts to `POST /api/contact`. Success is returned only after Resend accepts the message.

Create a `.env` file from `.env.example`:

```
RESEND_API_KEY=
CONTACT_EMAIL=
CONTACT_FROM_EMAIL=
```

Required setup:

1. Create a Resend account and API key.
2. Confirm the recipient with the business owner. The flyer lists `mssofarepair9@gmail.com`. The project brief also contained `info,abhisheksaroj@gmail.com`, which is invalid because of the comma. Do not guess. Put the confirmed address in `CONTACT_EMAIL`.
3. Set `CONTACT_FROM_EMAIL` to a verified Resend sender, for example `MS Sofa Repair <hello@your-verified-domain.com>`.
4. Redeploy or restart the dev server so the environment variables load.
5. Submit the form and confirm the email arrives.

Until those values are present, the API returns HTTP 503 and the form shows an error. It does not fake a successful send.

Locally, Vite serves `/api/contact` through a development middleware that uses the same validation and Resend logic as the Vercel function.

## WhatsApp

The site uses `+91 95552 95528` (`https://wa.me/919555295528`). Prefilled messages include a selected service when the visitor has chosen one. WhatsApp messages are not stored by this website.

## Analytics

Set `VITE_GA_MEASUREMENT_ID` only if Google Analytics should load. Add a consent banner before using this on paid traffic if that is required for the campaign region. Analytics has not been verified in this project.

## Brand and content notes

- Business facts come from the supplied flyer in `public/brand/flyer.jpg`.
- Photography is illustrative interior imagery, not photographs of completed customer projects.
- The site uses “Request a Quote”, not “free quote”, because a free quote was not confirmed.
- “Trusted by thousands” and directory badges from the flyer were not used as verified claims.
- Three.js, React Three Fiber, Drei, and Lenis are installed but unused. The experience is GSAP + CSS to keep ad-landing performance high.

## Deploy on Vercel

1. Push the repo and import the project in Vercel.
2. Add `RESEND_API_KEY`, `CONTACT_EMAIL`, and `CONTACT_FROM_EMAIL` as project environment variables.
3. Deploy.
4. Replace the placeholder loc in `public/sitemap.xml` with the production domain.
5. Test a real form submission.

## Scripts

- `npm run dev` — Vite development server
- `npm run build` — production build
- `npm run preview` — preview the production build
