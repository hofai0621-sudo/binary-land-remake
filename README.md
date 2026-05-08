# Lumapair

Original browser-playable twin-signal puzzle built with HTML5 Canvas.

Live site target: Vercel static deployment.

## Current Commercialization Status

- Public-facing title, metadata, character names, visual language, enemies, traps, items, and help text have been changed to the original `Lumapair` concept.
- The old one-sided permanent trap problem has been removed. Standard stages now place snares and major hazards as mirrored pairs, and trapped runners can escape by pressing movement keys or `Z`/`Space`.
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
