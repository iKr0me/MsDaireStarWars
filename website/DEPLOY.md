# Publish the website with saved notes

Supabase stores the messages and photos. You approve them in the Supabase dashboard. GitHub stores the website code, and Vercel runs the website and its small server API.

The code is prepared, but real saving needs your Supabase project and private settings first. No account has been created, real submission saved, or deployment made as part of preparing these files. This guide replaces the earlier demo-only deployment instructions.

## 1. Connect Supabase first

Follow [SUPABASE-SETUP.md](./SUPABASE-SETUP.md) through the local submission-and-approval walkthrough. It includes the database setup, private photo storage, and the three settings you need:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `VISITOR_COOKIE_SECRET`

Keep their real values out of GitHub and chat. Put them in `website/.env.local` locally and in Vercel's Environment Variables later. `.env.example` contains placeholders you can safely publish. Do not rename the server settings with a `VITE_` prefix.

## 2. Publish the project using GitHub Desktop on your Mac

A **repository** is your project folder with its saved change history. A **commit** saves a checkpoint on your Mac; **Publish repository** or **Push origin** uploads those checkpoints to GitHub. The prepared `project` folder already has a local repository, so add that existing folder to Desktop.

### A. Sign in and select the correct folder

1. Open **GitHub Desktop**. If prompted, choose **Sign in to GitHub.com**, complete the browser sign-in, and return to the app. If needed, account settings are under **GitHub Desktop → Settings → Accounts**.
2. In the Mac menu bar at the top of your screen, choose **File → Add Local Repository…**.
3. Click **Choose…**. In the Finder window, press **Command + Shift + G**, paste this path, then press **Return**:

   ```text
   /Users/sebastian/Downloads/Ms-Daire-Cursor-Kit 2/project
   ```

4. Select that folder and click **Open**, then **Add Repository** in GitHub Desktop.
5. The **Current Repository** selector near the top left should now show `project` (or the name you previously gave it). Use **Repository → Show in Finder** to confirm that it points to the path above.

Select the folder named **project**, which contains `website`, the guides, and `.gitignore`. Keep editing this same copy in Cursor. Selecting `website` alone or the outer kit folder can select the wrong repository. If Desktop says the folder is already added, select it from **Current Repository**. If it says the folder is not a Git repository, check the exact path above first; this prepared copy already has Git history.

[GitHub's instructions for adding a local repository](https://docs.github.com/en/desktop/adding-and-cloning-repositories/adding-a-repository-from-your-local-computer-to-github-desktop).

### B. Review and commit the current changes

1. Open the **Changes** tab on the left. Each checked file will be included in your next commit. Click a filename to see its changes on the right.
2. Include the website source and setup files: `website/index.html`, `website/src`, `website/api`, `website/server`, `website/supabase`, package/configuration files, and the supplied assets under `website/public`. Include the updated guides and preserve asset credits. Previously committed files will already be in **History**, so they will not all appear under Changes.
3. Check that your real settings file, **`website/.env.local`**, is absent from Changes. It is intentionally ignored. `.env.example` contains placeholders and is safe to include. `node_modules`, `dist`, and `dist-demo` should also be absent.
4. If you see **`website/env.local` without the leading dot**, leave it unchecked: that is a different filename and is not covered by the existing `.env*` rule. Keep real settings in `.env.local`. Also leave stray files named `website/vite` or `website/ms-daires-galaxy@0.1.0` unchecked if they appear; they are not project files.
5. At the bottom left, enter a **Summary**, for example `Prepare Ms. Daire website for deployment`. The longer description is optional.
6. Click **Commit to main** (or **Commit to** the branch shown in your app). If it asks for your Git author name and email, complete that prompt, then commit.
7. Once everything you intended to save is committed, Changes should be empty except for any stray files you deliberately left unchecked. If Desktop already says **No local changes**, your checkpoints are already saved; continue to publishing.

You do not need to run a build or upload the generated `dist` folder to GitHub. Vercel builds the website from the source code.

### C. Publish the repository

1. Click **Publish repository** near the top of GitHub Desktop.
2. In **Name**, enter a repository name such as `ms-daire-galaxy`.
3. Optionally add a description, such as `A galaxy of get-well notes for Ms. Daire`.
4. Leave **Keep this code private** checked if you want only you and invited collaborators to see the code. You can deploy a public website from this private repository. Uncheck it if you want the club to browse the code publicly.
5. If an **Organization** selector appears, choose your personal account / **None**, unless you intend to publish to a club organization you control.
6. Click **Publish Repository** and wait for the upload to finish. The models may make the first upload take a little while.
7. Choose **Repository → View on GitHub** to open the uploaded repository in your browser.
8. Confirm that its top level contains **website**. Open that folder and confirm that `index.html`, `package.json`, `src`, `api`, and `public` are present. Your `.env.local` must not be there. Files that were unchecked and never committed stay on your computer.

[GitHub's instructions for publishing an existing project](https://docs.github.com/en/desktop/adding-and-cloning-repositories/adding-an-existing-project-to-github-using-github-desktop).

If Desktop already shows **Push origin** instead of **Publish repository**, the project is already connected to an online repository. Check **Repository → View on GitHub** to verify the destination, then click **Push origin** to upload your new commits there. **Fetch origin** checks for remote updates; it does not create a missing commit.

### D. Send future website updates

After editing this same project in Cursor: save your files, return to GitHub Desktop, review **Changes**, enter a Summary, click **Commit to main**, then **Push origin**. Once Vercel is connected in the next section, pushes to its production branch trigger a new deployment. Changes saved only on your Mac do not update the deployed website.

For this workflow, do not drag the project into GitHub's browser upload page. Some included models exceed that uploader's 25 MiB limit; ordinary Git supports individual files up to 100 MiB. [GitHub file-size documentation](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github).

When the browser shows your uploaded code, continue below. In Vercel you will select this repository and set **Root Directory** to **website**.

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
