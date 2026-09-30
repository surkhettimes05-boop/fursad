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
