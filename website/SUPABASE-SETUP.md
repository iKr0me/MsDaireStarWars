# Set up saved notes and approve them in Supabase

You can manage the entire approval queue in Supabase. Visitors do not need an account: they write a note on the website, it waits in your private queue, and only approved messages appear for Ms. Daire and other visitors. Names and approved photos are also public once approved.

The website code is prepared. Nothing is connected to a real Supabase project yet; complete the following setup before expecting shared notes to save.

## Create your project

1. Sign into [Supabase](https://supabase.com/dashboard) and create an organization if prompted.
2. Create a new project, for example `ms-daire-notes`. Choose an appropriate region and save the database password in your password manager. This application does not need that password in its settings.
3. Wait until the project is ready. Choose a plan suitable for your use; check its current storage and usage limits in your dashboard.

You do not need to create student accounts, an Auth login screen, or a separate approval website.

## Create the tables and private photo storage

1. In the project dashboard, open **SQL Editor → New query**.
2. Open the supplied file [supabase/migrations/202610140001_notes.sql](./supabase/migrations/202610140001_notes.sql) in your editor.
3. Copy the entire file into that query and click **Run**. Wait for the success result. If it reports an error, resolve that error before proceeding.
4. In **Table Editor**, select the `public` schema and confirm there is a `notes` table.
5. In **Storage**, confirm there is a bucket named `note-photos` and that it is **Private**. The supplied SQL sets up this bucket; you do not need to create it separately.

Supabase supports database setup through its SQL Editor and row editing through its Table Editor. [Database dashboard documentation](https://supabase.com/docs/guides/database/overview).

Keep the bucket private. The website's server checks both note and photo approval before returning an image. Making the bucket public would let anyone with an image URL bypass that check. [Supabase private and public buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals).

## Add three private settings

In `website/`, copy `.env.example` to a new file named `.env.local`. Replace its placeholder values with your own:

| Setting | What to put there |
| --- | --- |
| `SUPABASE_URL` | Your project's API URL, such as `https://your-project.supabase.co`. Find it through the project's **Connect** dialog. |
| `SUPABASE_SECRET_KEY` | Your project's secret key from **Settings → API Keys**. Prefer a new key beginning `sb_secret_`. This implementation also accepts a legacy `service_role` key. Do not use an `anon` or publishable key here. |
| `VISITOR_COOKIE_SECRET` | A random secret at least 32 characters long, generated for this site. It signs the anonymous visitor cookie used for the basic submission limit. |

Secret keys belong on the server and bypass Supabase's row security, so keep them out of frontend code, GitHub, and chat. This site calls its own server API and does not need a browser Supabase key. Do not give these names a `VITE_` prefix. [Supabase API-key guide](https://supabase.com/docs/guides/getting-started/api-keys).

To generate the cookie secret on your Mac, run this once in Terminal and copy the result into `.env.local`:

```sh
openssl rand -hex 32
```

Use the same three values in Vercel when deploying. `.env.local` stays only on your computer and is ignored by Git. Keep the generated cookie secret stable; changing it resets existing visitor identities and their browser-based allowance.

## Try one real note locally

Open a terminal in `website/` and run:

```sh
npm ci
npm run dev:live
```

Open the local URL printed in the terminal. `dev:live` runs the local server API and saves to your Supabase project, so these submissions are real. Regular `npm run dev` remains the sample-note demo with unlimited delivery previews.

1. Click **Write a note**. Enter a test name and a short message; the maximum is 400 characters including spaces.
2. Optionally attach your own test photo and confirm permission to share it publicly. The upload accepts JPG, PNG, or WebP up to 5 MB; the site resizes and converts it before storage.
3. Submit. A successful response means it was saved for review, not published.
4. Open Supabase's `notes` table. Refresh the table if necessary; the new row should have `status = pending`.
5. Open the local website in another browser or private window. It should not show that pending note.
6. Approve it using the steps below, refresh the second browser, and press R2-D2. The approved note should now be available there.
7. Set your test note to `rejected`, refresh the second browser, and confirm it is removed from the available notes.

This walkthrough verifies that a submission survives across browsers and that approval controls publication. Until you complete it with your own project, the live Supabase connection has not been verified.

## Approve notes in Supabase

1. Open **Table Editor → public → notes**.
2. Filter `status` to `pending`, and sort `created_at` to see the oldest waiting notes first.
3. Read `sender`, `message`, `moderation_status`, and `moderation_flags` for each row. `moderation_status` is `passed` or `flagged`. The automatic text checks flag common profanity, threats, and links. They help review; they do not understand every context or guarantee a message is appropriate. Every valid completed submission waits for your decision, including those marked `passed`.
4. If `photo_path` has a value, open **Storage → note-photos** in another tab. Find the matching file, such as `<note-id>.jpg`, and preview or download it to review. Supabase supports downloading files from the Storage dashboard. [Storage dashboard guide](https://supabase.com/docs/guides/storage/quickstart).
5. If screening marked the text `flagged`, decide whether it is actually appropriate. Reject inappropriate content. For a false positive you have personally reviewed, set `moderation_override` to `true` and save that change first. Keep the original `moderation_status` and `moderation_flags`; changing only `status` cannot approve a flagged note.
6. To approve the text, edit `status` to exactly `approved` and save the cell or row. If the photo is also suitable, separately set `photo_approved` to `true` and save. A photo appears only when both approvals are in place.
7. To reject a submission, set `status` to `rejected`. To publish its text without the attached photo, leave `photo_approved` as `false` and set the note's `status` to `approved` after the required text review.

You may also edit the name or message before approving it. Do not edit the note ID, storage path, or recorded screening result as part of normal review. `moderation_override` is the explicit way to record your decision about a false positive. The approval workflow does not need changes to the website code or a Vercel redeployment.

| Status | Meaning | Shown on website? |
| --- | --- | --- |
| `uploading` | A photo submission is still being completed. Do not approve it. | No |
| `pending` | Complete submission awaiting your review. | No |
| `approved` | Approved name and message. Photo still needs `photo_approved = true`. | Yes |
| `rejected` | Hidden submission. | No |

To withdraw a published message later, change its status to `rejected`. To hide only its photo, set `photo_approved` to `false`. The website will stop serving withdrawn content on a fresh fetch, but cannot erase a copy someone already viewed or saved. For permanent removal, also delete its file from Storage and its row from the Table Editor after you no longer need the record.

An `uploading` row that stays incomplete is not public. Its temporary submission reservation expires after 15 minutes and then stops using a slot; a failed or incomplete upload does not receive a final saved receipt. The sender can retry the same draft, which reacquires a slot if one is available. Otherwise, the form asks them to retry after the limit resets. A successful completion starts that note's rolling 24-hour quota window.

An abandoned `uploading` row can be left hidden while you investigate, or removed along with its matching file through the dashboard. Do not promote it to `approved` to work around a failed upload.

## Submission limits and screening

- Real submissions allow five notes per rolling 24 hours for each signed browser cookie. This is a basic limit, not verified per-person identity: someone can clear cookies or use another browser. Classmates sharing school Wi-Fi do not share one IP-based allowance.
- A retry of the same submission does not save a second copy or use another allowance. Repeating the same name and message from the same browser within 24 hours is also blocked as a duplicate.
- Deleting a successfully saved note does not restore its submission allowance. The separate quota record remains for enforcement of the rolling 24-hour window, including for later rejected or deleted notes.
- The local demo stays unlimited. Use it to rehearse animations without filling your approval queue.
- Photo files stay private until explicitly approved. The server validates and re-encodes photos, but you still review their content yourself.
- Screening uses local rules, so no external AI moderation account or key is required. Organizer approval is the final check.

For the public link, continue with [DEPLOY.md](./DEPLOY.md). The deployment guide covers GitHub, Vercel's `website` root directory, private environment variables, and a final check on the deployed URL.
