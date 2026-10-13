# Publish the demo on GitHub and Vercel

The prepared folder is `/Users/sebastian/Downloads/Ms-Daire-Cursor-Kit 2/project`.

This version demonstrates the scene, sample heart notes, collection and Falcon delivery preview. It does not accept real shared notes or photos. The Send workflow remains explicitly a preview until Supabase saving, text screening and organizer approval are connected. No environment variables or API keys are needed for this demo.

## GitHub Desktop

1. Open GitHub Desktop and sign into your GitHub account.
2. Choose **File → Add Local Repository** and select the `project` folder above. A local Git repository and checkpoint have been prepared there.
3. Click **Publish repository**. Choose your repository name and visibility, then publish. Preserve asset credits in this repository.
4. Include `website/public/models` and `website/public/audio`. Dependencies, generated builds, Vercel local state and private environment files are ignored.

Use GitHub Desktop or Git rather than the GitHub browser’s Upload files page: `planet_of_phoenix.glb` is approximately 51.5 MB, above the browser’s 25 MiB limit. Included files are below GitHub’s 100 MiB Git-file limit. [GitHub documentation](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github).

## Vercel

1. Sign into Vercel. Choose **Add New → Project** and import your published GitHub repository.
2. Set **Root Directory** to `website` (the folder containing `package.json`).
3. Framework: **Vite**. The included `website/vercel.json` sets these values:
   - Install command: `npm ci`
   - Build command: `npm run build:demo`
   - Output directory: `dist-demo`
4. Node.js version: **24.x**, also pinned in `website/package.json`.
5. Leave environment variables empty for the demo and click **Deploy**.
6. Open the returned URL. Check the intro, both hyperspace transitions, R2 press, pink heart flight, text fade, close/collection, music button, farewell and scrolling back up. Check once on a phone, too. Music starts after pressing its control, as required by browsers.

[Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite), [Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

If you publish only the contents of `website/` as a separate repository, leave Root Directory at the repository root instead. The same `vercel.json` works there.

## Local commands

Run from `website/` with Node.js 24:

```sh
npm ci
npm run dev
```

Validation and a local demo build:

```sh
npm test
npm run build:demo
npm run preview -- --outDir dist-demo
```

`npm run build` intentionally still excludes sample notes and produces the unconnected production shell in `dist/`. Vercel currently uses the explicit demo build so the public demo has sample hearts to read. Once the real backend is implemented and verified, change `vercel.json` to `npm run build` with output directory `dist`.

Keep the source GLB originals when later optimizing web asset size. Large model downloads can affect first load on phones. The build currently reports a large JavaScript chunk advisory; it completes successfully. New visual details have not been browser-verified because of the existing browser permission restriction.
