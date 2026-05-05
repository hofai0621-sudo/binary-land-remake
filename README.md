# Binary Land Remake - Web

Browser-playable Canvas port of the Binary Land Remake prototype.

Live site: [https://binary-land-remake.vercel.app](https://binary-land-remake.vercel.app)

## Records

- Installation and deployment notes: [vercel_deployment_installation_2026-05-05.md](./vercel_deployment_installation_2026-05-05.md)
- Deployment diary: [binary_land_vercel_deployment_diary_2026-05-05.md](./binary_land_vercel_deployment_diary_2026-05-05.md)
- Hard-mode playtest diary: [binary_land_playtest_diary_2026-05-05.md](./binary_land_playtest_diary_2026-05-05.md)

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
