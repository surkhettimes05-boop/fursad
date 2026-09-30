# FURSAD site configuration

This repository is intentionally a static website.

## Public contact details

Edit `assets/site-config.js`:

- `whatsappNumber`: digits only, including country code, with no `+`, spaces or dashes.
- `businessEmail`: the public business email address.

Until configured, WhatsApp and business-email CTAs render as disabled instead of sending visitors to a dead or misleading destination.

## Production domain

The current canonical origin is:

`https://fursad-blue.vercel.app`

It is used in canonical links, Open Graph URLs/images, Product structured data, `robots.txt`, and `sitemap.xml`.

When the final custom domain is connected, replace `https://fursad-blue.vercel.app` everywhere with the final HTTPS origin in one commit.

## Brand ownership

Public-facing Pasalho ownership references are intentionally removed from this consumer site. Keep legal ownership disclosures only where required by applicable law, packaging, invoices, or regulatory documents.


## Admin CMS

The private admin interface lives at `/admin/`.

Before publishing can work, configure these Vercel environment variables:

- `ADMIN_PASSWORD` — a strong private password for the admin panel.
- `GITHUB_TOKEN` — a GitHub token with write permission to this repository.
- `GITHUB_REPO` — optional; defaults to `surkhettimes05-boop/fursad`.
- `GITHUB_BRANCH` — optional; defaults to `main`.

The browser never receives the GitHub token. Admin writes go through the Vercel function at `/api/admin`.

Managed content is stored in `data/content.json`. Publishing creates a GitHub commit, which triggers the normal Vercel deployment. Media uploads are limited to 3 MB and are stored in `assets/uploads/`.

Do not put `ADMIN_PASSWORD` or `GITHUB_TOKEN` into committed HTML, JavaScript, or environment files.
