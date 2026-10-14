# Ms. Daire’s Galaxy

A Star Wars themed get-well website with the R2-D2 heart reader, collected notes, reversible hyperspace scenes, and Falcon delivery animation.

Real notes are saved through Vercel Functions to Supabase. All submissions wait for organizer approval in Supabase’s Table Editor. Optional photos stay in private Storage and require separate approval. Automatic text checks flag messages for review; they do not replace your review.

Start with [SUPABASE-SETUP.md](SUPABASE-SETUP.md) for account creation, the supplied database script, local settings, and approval steps. Then follow [DEPLOY.md](DEPLOY.md) to publish through GitHub and Vercel. The code is prepared; a live Supabase project and its credentials are still needed.

From this folder with Node.js 24:

```sh
npm ci
npm run dev
```

`dev` is the unlimited, clearly labeled demo: it never saves real notes. `npm run dev:live` uses the real API and the private settings in `.env.local`. `npm run build` creates the production site in `dist`; `npm run build:demo` creates the isolated rehearsal version in `dist-demo`.

`npm test` covers the reading queue, input boundaries, API behavior, and the database migration in isolated PostgreSQL. No live secrets or accounts are needed to run these checks. See [SETUP.md](SETUP.md) for implementation details and verification limits.
