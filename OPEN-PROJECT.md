# Open and publish this project

Open this `project` folder in Cursor. The working website is in `website/`; continue it rather than starting over.

From `website/`, run `npm ci` and `npm run dev` using Node.js 24.

For GitHub and Vercel publishing, read [website/DEPLOY.md](website/DEPLOY.md). A local Git repository is prepared in this project folder. Add it to GitHub Desktop, publish it, then import the repository in Vercel with Root Directory `website`. The included configuration publishes the labeled demo, with sample notes and delivery previews. Real shared notes/moderation are not connected yet.

Source code, assets, attribution, references and tests are included. Dependency folders and generated builds are omitted because the commands recreate them.
