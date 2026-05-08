# 小寶貝飛飛雙向奔赴

Browser-playable mirrored two-character puzzle built with HTML5 Canvas.

Live site target: Vercel static deployment.

## Current Commercialization Status

- Public-facing title, metadata, character names, help text, and title-screen presentation now use the `小寶貝飛飛雙向奔赴` brand.
- The left-side character is `飛飛`, drawn from `assets/characters/feifei.jpg`.
- The right-side character is `淳忻忻`, drawn from `assets/characters/chunxinxin.jpg`.
- The old one-sided permanent trap problem has been removed. Standard stages place snares and major hazards as mirrored pairs, and trapped characters can escape by pressing movement keys or `Z`/`Space`.
- Historical project notes are excluded from deployment through `.vercelignore`; keep them out of any public storefront or marketing bundle.

## Local Preview

```bash
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173`.

## Deploy

This is a static site and can be deployed directly to Vercel from the project root:

```bash
npx vercel --prod
```

Before selling publicly, complete the checklist in [ORIGINALITY_AND_COMMERCIALIZATION_PLAN.md](./ORIGINALITY_AND_COMMERCIALIZATION_PLAN.md).
