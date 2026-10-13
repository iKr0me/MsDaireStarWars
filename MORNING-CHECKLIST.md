# Your morning build checklist

## Before opening Cursor

1. Extract the latest `Ms-Daire-Cursor-Kit.zip` into a normal working folder. Keep the ZIP as a backup. Do not edit files inside the ZIP.
2. Sign into Cursor with the coding access you already have. Open the Codex extension you already use. Keep one main agent on GPT-6.1 Sol with Medium thinking if available; use High for difficult debugging or permissions work. Your actual Codex model picker determines availability. ChatGPT sign-in uses your included Codex allowance; avoid API-key sign-in if you want to avoid separate coding API charges.
3. Read `START-HERE.md`. The new site goes in `website/`; the supplied Roo version is already copied into `reference/roo-prototype/`. No manual rebuilding of the 3D models is needed.
4. Optional: open `audio/preview.html` to compare the two included sound effects. The exact Force Theme still needs a permitted audio file. This does not block the visual build.

## First Cursor session

5. In Cursor choose **File → Open Folder**, then select the entire extracted kit. Do not open just `index.html`, the old Desktop prototype, or an individual GLB.
6. In the Codex sidebar, attach `Cursor-Prompt-Ms-Daire.md` using Cursor’s file attachment/context control. Also attach `START-HERE.md` and `3D_Models/README.md`. The other files remain available in the workspace.
7. Copy the contents of `FIRST-CURSOR-MESSAGE.md` into that chat and send it. Cursor should inspect the files, verify Node/Git, create `website/`, install its local dependencies, copy the six selected models and included audio, and build the first interaction. You do not need to connect Supabase through an editor plugin.
8. Use the exact local start command Cursor gives you. View the running local URL instead of double-clicking the site’s HTML. OpenAI/Supabase credentials should not be needed for the clearly labeled sample-note demo.
9. Test this first slice before requesting more polish:
   - The X-wing moves nearer/farther as well as sideways and stays easy to tap.
   - Press R2 once: one heart begins at his position at that moment.
   - Repeated presses during flight, reading, closing, and departure do nothing.
   - The letter is large and readable, its name/message change per note, and the background remains unblurred.
   - Closing a new note adds one to Notes collected; reopening it from the collection adds nothing.
   - Both included sound choices can play after a user gesture, and sound failures do not interrupt reading.
10. Give precise feedback, such as “the heart starts below R2” or “the text is too small on my phone.” Ask Cursor to checkpoint the working slice before moving on. Avoid requesting the entire site again whenever one detail needs fixing.

## Build the rest in this order

11. Add the scroll-driven crawl, reversible hyperspace transitions, Coruscant framing, subtle chase ships, and farewell. Test scrolling in both directions, including reversing midway through a transition. Keep the reading experience calm.
12. Add the 400-character writing form, name, optional photo preview, and Falcon delivery. In demo mode the confirmation must say the submission is simulated. The real Falcon animation must later wait for confirmed saving.
13. Create the accounts for real notes: a dedicated **Supabase** project and an **OpenAI API** project/key with moderation access. Cursor’s coding subscription is separate from API access. Let Cursor generate `website/SETUP.md`, migrations, and `.env.example`; follow those exact instructions and enter secrets privately. You can create/sign into Vercel and GitHub now, but deploying can wait.
14. Connect the real backend. Use direct private photo uploads, automatic name/message screening, pending review, five successful notes per browser per rolling 24 hours, and persistent duplicate protection. Keep the demo adapter separate from production. Ask Cursor to test the actual endpoints with a local server that runs Vercel Functions; a frontend-only Vite server is insufficient for this stage.
15. Approve a harmless test note in **Supabase → Table Editor → notes**: filter pending, review the name/message/screening result, review its optional photo in private Storage, then save approved. Failed screening or unfinished photo processing must block approval at the database level. A flagged but completed screening can only be overridden deliberately by the organizer.
16. Open a second browser/private window. Confirm that it sees the newly approved note and cannot see pending/rejected material. Then test a duplicate send, the sixth send inside 24 hours, and the collection after every note has been read. Repeat reads must not raise the count.

## Before the real launch or classroom demo

17. Test on a phone: loading, readable notes, portrait upload, the keyboard, tap targets, and reduced motion. Test with music absent and with effects muted. Add the permitted Force Theme file later and test one shared player across forward/backward scrolling; do not promise a seamless loop before listening to the end/start boundary.
18. Ask Cursor to prepare the GitHub/Vercel setup. A private code repository is fine; the deployed website is public. When importing the kit-root repository to Vercel, use **Root Directory: `website`** and the actual build/output settings in the generated setup guide. Enter production server keys in Vercel settings, not browser files.
19. After you authorize deployment, test submit → approve in Supabase → read on the deployed URL while signed out. Remove test notes. Tell contributors that approved names/messages/photos are public. Share with Ms. Daire after real notes have been approved.
20. For the hackathon demonstration, keep the separately labeled demo build with sample messages and Reset demo ready. Also demonstrate one real approved note if the network is working. Check that Supabase is active before the event. Describe simulated saving/moderation honestly.

You can begin steps 1–12 without the final music recording or production credentials. Those missing items should not stop the first working scene. The full experience still needs implementation and visual iteration; this kit is not a finished deployed website.
