# Al Shehza Foundation

Website for Al Shehza Foundation (Guarantee) Limited. Includes seven programmes, project photo slideshows, the foundation story, and contact details.

- Repository: https://github.com/Muhthaseem/AlShehza_NGO_WebsiteV2
- Website: https://muhthaseem.github.io/AlShehza_NGO_WebsiteV2/
- Deployment workflow: `.github/workflows/deploy-pages.yml`

## Run locally

Requires Node.js 22.13 or later and npm.

```powershell
npm ci
npm run dev
```

Open the local URL printed in the terminal, usually http://localhost:5173. Press Ctrl+C to stop.

## Update the website

Edit the files, commit, and push to `main`. GitHub Actions builds and deploys the website automatically. Check the repository's **Actions** tab for progress and deployment errors.

```powershell
git add .
git commit -m "Update website"
git push origin main
```

Useful files:

| File | Purpose |
| --- | --- |
| `app/page.tsx` | Main content, programmes, story, and contacts |
| `app/globals.css` | Layout, typography, colours, responsive styles, and effects |
| `components/hero-slideshow.tsx` | Four-second hero photo rotation |
| `components/project-slideshow.tsx` | Four-second programme slideshows and selection dots |
| `public/images/` | Optimised project photos and brand assets |
| `NGO_PROFILE.md` | Organisation reference information |
| `lib/site-assets.ts` | Asset paths for repository URLs and custom domains |

## GitHub Pages build

GitHub Pages serves the static `out/` export. The workflow uses GitHub's Pages configuration to determine the correct base path automatically. No deployment token or other secret needs to be added to the repository.

To test the repository URL build locally in PowerShell:

```powershell
$env:NEXT_PUBLIC_BASE_PATH = '/AlShehza_NGO_WebsiteV2'
npm run build:pages
Remove-Item Env:NEXT_PUBLIC_BASE_PATH
```

For a root/custom-domain export, leave `NEXT_PUBLIC_BASE_PATH` unset and run `npm run build:pages`.

The original `npm run build` still builds the Vinext/Cloudflare Worker version. `npm start` serves that Worker build locally; it does not serve the GitHub Pages export. The unused database and authentication starter utilities are not required by the static website.

## Add a custom domain later

1. Open this repository's **Settings → Pages → Custom domain**, enter the domain you own, and save.
2. Configure your domain provider's DNS. A `www` or other subdomain uses a CNAME pointing to `muhthaseem.github.io` (without the repository path). For an apex/root domain, follow the A or ALIAS/ANAME instructions in the official guide below.
3. Wait for GitHub's DNS check and certificate, then enable **Enforce HTTPS** when available.
4. Open **Actions → Deploy website to GitHub Pages → Run workflow**, select `main`, and run it. The new build automatically uses the custom domain's root path.

No source-code path changes or placeholder CNAME file are needed. This Actions-based setup reads the domain from GitHub Pages settings. If you later remove the custom domain, rerun the workflow to restore repository-prefixed paths.

Official guide: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## Checks

```powershell
npx tsc --noEmit
npm run build:pages
```

Keep `.env` files, credentials, `node_modules/`, and generated build folders out of Git; the included `.gitignore` covers them.

## Theme and language controls

The header includes a light/dark toggle. Light is the default; the visitor's choice is saved on their device. Dark mode applies before hydration to avoid a light flash on returning visits.

The searchable language picker offers built-in Tamil and Sinhala translations, defined in `lib/local-translations.ts`. These languages update the full page in place, work on localhost, and are saved in the URL (`?lang=ta` or `?lang=si`) and on the device. English is available with `?lang=en`. The original-language brand names, email addresses, and phone numbers stay unchanged.

Other languages use Google Translate in the same tab. Switching from a Google translation back to Tamil or Sinhala returns to the original site with its built-in translation. Google needs a publicly accessible URL; its live service cannot translate localhost or private sign-in-only pages. The language helper prevents nested translated URLs and ensures Google translates from the English version.
