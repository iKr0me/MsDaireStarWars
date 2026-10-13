# Ms. Daire’s Galaxy

A local 3D demo with an opening crawl, reversible hyperspace crossings, Phoenix and a floating standalone R2-D2, faster green-laser chases, a heart-shaped reader and collected-note gallery, and a farewell.

From this folder, run `npm install` and `npm run dev`, then open the printed localhost URL. Read [SETUP.md](SETUP.md) for current scope and the demo/production distinction.

The demo uses six invented notes, a visible sample label, unique collection progress, and Reset demo. The Write a note form previews Falcon delivery only. Real submissions, moderation and cloud services are not connected.

`npm test` verifies reading/count/queue locks and the reversible chapter mapping. `npm run build:demo` creates the rehearsal build; `npm run build` excludes fixture data and shows an unconnected preview until the real adapter exists.

For GitHub publishing and Vercel import settings, read [DEPLOY.md](DEPLOY.md). The included Vercel configuration publishes the visibly labeled demo; real submissions remain unconnected.
