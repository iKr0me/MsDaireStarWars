# Ms. Daire’s Galaxy — current implementation

The website now includes the real saved-note flow. Create the Supabase project and connect it using [SUPABASE-SETUP.md](SUPABASE-SETUP.md); use [DEPLOY.md](DEPLOY.md) for GitHub and Vercel. Those two guides replace the older kit’s account/backend preparation directions.

## Local modes

Run these commands from `website/` using Node.js 24:

```sh
npm ci
npm run dev
```

The regular development mode is the existing demo with six invented notes, unlimited delivery previews, a sample label and Reset demo. It does not contact the live note API.

For real saving, copy `.env.example` to `.env.local`, enter the three server-only values from the setup guide, run the supplied SQL in Supabase, then start:

```sh
npm run dev:live
```

The local server runs the same API handlers used by Vercel. Restart it after changing private settings. Missing configuration produces an honest unavailable message and never a false save confirmation. The audio choice and visual scene can initialize while the approved-note list loads.

## Saved-note flow

1. The form validates a name, a message of up to 400 user-visible characters including spaces, and an optional photo with permission to publish it.
2. The browser resizes a photo from the allowed 5 MB source into a JPEG of at most 1 MB. The server decodes and re-encodes it again, strips metadata, and stores only that processed portrait in a private Supabase bucket. This keeps the request below Vercel’s body limit.
3. A signed anonymous browser cookie identifies the basic five-per-24-hour allowance. PostgreSQL serializes submissions for that identity. Retries preserve the request ID and payload hash; repeated text is also checked.
4. Built-in text rules screen the name and message. Every completed note still waits for manual approval; flagged notes additionally require an explicit organizer override before approval. No AI-provider account/key is required by this implementation.
5. The server confirms a durable pending submission before the form compacts and the Falcon launches. Animation errors after a confirmed save never turn that save into a failed submission.
6. The organizer reviews `public.notes` in Supabase’s Table Editor. The private photo must be reviewed and approved separately. Public endpoints return approved content only, with no private screening or visitor metadata.
7. The website refreshes approved notes every 45 seconds while visible and idle, on window focus, and when R2 selects a new note. Collection rereads recheck current availability. Counts record unique opened note IDs and do not rise for repeats.

A browser cookie is not verified identity: clearing it or using another browser creates a separate allowance. Students sharing school Wi-Fi do not share an IP-based five-note quota. The built-in checks are a review aid, not a guarantee against every inappropriate message.

## Builds and verification

```sh
npm test
npm run build
npm run build:demo
```

- Production: `dist/`, live API, no sample-note fixture module. This is the build configured in `vercel.json`.
- Demo: `dist-demo/`, sample adapter, unlimited animation rehearsals, no real writes.
- Automated checks use mocked service responses and PostgreSQL compiled to WASM for the actual database migration. They exercise role grants, pending visibility, approval/photo guards, quotas and retries. They do not establish a live Supabase connection or prove multi-server concurrency.
- All 55 automated checks and both builds pass. The local live endpoint was also checked without credentials: it reports unavailable, rejects cross-origin writes, and does not claim to save. The production bundle excludes sample fixtures and server secret identifiers.
- Complete the submit → pending → approve → read in a second browser → withdraw walkthrough with the actual project before sharing the live URL.
- Browser/GPU review remains unavailable under the existing saved browser permission setting. The new portrait placement and form’s live states still need visual checking. The production build retains the existing JavaScript chunk-size advisory.

## Code map

- `src/scene.js`, `src/journey.js`, `src/journey-state.js`: approved scene choreography, R2/Falcon flight and reversible transitions.
- `src/notebook.js`, `src/reader.js`: collection, shuffle, reader lock, heart animation and safe plain-text/photo rendering.
- `src/composer.js`, `src/submission.js`, `src/photo.js`: form, retry IDs, previews, validation and photo preparation.
- `src/data.js`, `src/live-data.js`, `src/demo-data.js`: isolated live/demo data adapters.
- `api/notes.js`, `api/photo.js`, `server/notes-service.js`: Vercel endpoints, session signatures, screening, validation and Supabase requests.
- `supabase/migrations/202610140001_notes.sql`: tables, private photo bucket, restricted RPCs, review guards and atomic submission bookkeeping.
- `dev-api.js`, `vite.config.js`: local live API bridge; secrets remain server-side.
- `SUPABASE-SETUP.md`, `DEPLOY.md`: current setup and approval instructions.

All runtime models and audio remain local to the project. This work adds no external visual assets or tracking scripts. Preserve `ASSETS.md` and the supplied model/audio credits when publishing.
