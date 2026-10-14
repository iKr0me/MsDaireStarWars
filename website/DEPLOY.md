# Publish the website with saved notes

Supabase stores the messages and photos. You approve them in the Supabase dashboard. GitHub stores the website code, and Vercel runs the website and its small server API.

The code is prepared, but real saving needs your Supabase project and private settings first. No account has been created, real submission saved, or deployment made as part of preparing these files. This guide replaces the earlier demo-only deployment instructions.

## 1. Connect Supabase first

Follow [SUPABASE-SETUP.md](./SUPABASE-SETUP.md) through the local submission-and-approval walkthrough. It includes the database setup, private photo storage, and the three settings you need:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `VISITOR_COOKIE_SECRET`

Keep their real values out of GitHub and chat. Put them in `website/.env.local` locally and in Vercel's Environment Variables later. `.env.example` contains placeholders you can safely publish. Do not rename the server settings with a `VITE_` prefix.

## 2. Publish the project to GitHub

1. Open GitHub Desktop and sign in.
2. Choose **File → Add Local Repository** and select the project folder containing `website/`. For the prepared Downloads copy, this is `Ms-Daire-Cursor-Kit 2/project`.
3. Review the changed files. Include `website/src`, `website/api`, `website/server`, `website/supabase`, the configuration files, and the supplied models/audio under `website/public`. Keep asset credits.
4. Confirm that `.env.local`, `node_modules`, `dist`, and `dist-demo` are absent from the files being committed. The supplied ignore rules exclude them.
5. Commit your changes, then click **Publish repository**. Choose a name and visibility. If the repository already exists on GitHub, use **Push origin** instead.

Use GitHub Desktop or Git for this project. Some included models exceed the browser uploader's 25 MiB limit; Git accepts individual files up to 100 MiB. [GitHub file-size documentation](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github).

## 3. Import it into Vercel

1. Sign into Vercel and choose **Add New → Project**.
2. Connect your GitHub account if asked, then import this repository. [Vercel's Git import guide](https://vercel.com/docs/git).
3. Set **Root Directory** to `website`. If you published only the contents of `website/` as the entire repository, leave it at the repository root instead.
4. Use these build settings. The included `vercel.json` supplies the commands:

| Setting | Value |
| --- | --- |
| Framework | Vite |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node.js version | `24.x` |

Vercel serves the built frontend and runs the routes in `website/api` as server functions. You do not need a second backend host or the Supabase Vercel integration for this setup. [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite).

5. In **Environment Variables**, add the three settings from step 1 using their exact names. Select **Production**. Add them to **Preview** too only if you want preview deployments to read and submit to this same database. Sharing these values means preview submissions are real submissions.
6. Click **Deploy**. If this Vercel project was previously set to the demo build, replace any dashboard overrides for `build:demo` / `dist-demo` with `build` / `dist`.

Changes to Vercel environment variables apply to new deployments. If you add or correct a value after deploying, use **Deployments → Redeploy**. Never put these secret values into build commands or frontend source files. [Vercel environment variables](https://vercel.com/docs/environment-variables).

## 4. Check the deployed submission flow

1. Open the Vercel URL. An empty collection is expected until you approve at least one real note; sample messages belong to demo mode.
2. Submit one clearly labeled test note. The delivery animation should follow a successful save, and the page should say it is waiting for approval.
3. In Supabase, open **Table Editor → public → notes** and find that note with `status = pending`.
4. Open the website in a second browser or private window. The pending message must not appear there.
5. Review and approve it using [the approval steps](./SUPABASE-SETUP.md#approve-notes-in-supabase). Refresh the second browser and press R2-D2 to read it.
6. If you included a photo, verify it stays hidden until you also set `photo_approved = true`.
7. Change the test note to `rejected`, refresh the second browser, and confirm it is no longer available. Finish the test before sharing the public URL.

Also check the experience on a phone: audio choice, scrolling through both transitions, R2-D2, the heart, collected notes, and the send panel. API and database setup does not replace a visual check of the animation.

## Everyday updates

Code changes go to GitHub; Vercel deploys updates from its configured production branch. Approving or rejecting notes happens in Supabase and does not require a new deployment. Refresh the website to fetch approved notes immediately; it also refreshes automatically while the page is visible and idle, approximately every 45 seconds, when you return to the tab, and before drawing a note from R2-D2.

For local work, open a terminal in `website/`:

```sh
npm ci
npm run dev
```

`npm run dev` keeps the unlimited delivery-preview demo. To save real notes locally using `.env.local`, use:

```sh
npm run dev:live
```

Build commands:

```sh
npm run build
npm run build:demo
```

The first creates the live frontend in `dist`; the second creates the sample-note demo in `dist-demo`. Vite's static preview command alone does not run the saved-note API; use `dev:live` or the Vercel deployment for the real submission flow.

If saving fails, first check that the SQL setup completed, the three environment variables are present in the correct environment, and you redeployed after changing them. Vercel's function logs can help identify the failure; do not paste secret values into logs or screenshots.
