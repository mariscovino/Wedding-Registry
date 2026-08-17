# Automation setup (free, ~10 minutes)

The site works on its own, but with this backend the **gift progress bars fill up for
every visitor**, each gift and RSVP becomes a **row in a Google Sheet**, and the
**emails arrive automatically** (no third-party service, no activation step).

## 1. Create the spreadsheet + script

1. Go to [sheets.new](https://sheets.new) and create a spreadsheet (e.g. "Wedding — Registry").
2. Menu **Extensions → Apps Script**.
3. Delete the placeholder content and paste the entire [google-apps-script.gs](google-apps-script.gs) file.
4. Save (disk icon).

## 2. Publish it as a web app

1. Click **Deploy → New deployment**.
2. Type: **Web app**.
3. "Execute as": **Me** · "Who has access": **Anyone**.
4. **Deploy** → authorize with your Google account → copy the **Web app URL**
   (it ends in `/exec`).

## 3. Connect the site to the backend

In [index.html](index.html), find `const BACKEND_URL = ''` and paste the URL:

```js
const BACKEND_URL = 'https://script.google.com/macros/s/YOUR_ID/exec';
```

That's it. From then on:

- **Automatic bars** — the site reads the totals from the spreadsheet on load and every 2 minutes.
- **Living spreadsheet** — a "Presentes" tab (with a "Confirmado no extrato?" column for you
  to tick once you match each payment against the bank statement) and an "RSVP" tab
  (your guest list, ready-made).
- **Instant emails** — gifts@ and rsvp@mariandethan.com receive every record the moment it happens.

## Notes

- Automatic sending **does not work in the claude.ai preview** (its sandbox blocks
  all external requests). Test on the hosted site (e.g. GitHub Pages).
- If you edit the script later, use **Deploy → Manage deployments → edit (pencil)
  → New version** so the URL stays the same.
- Google's free limits: 100 emails/day — far more than you'll ever need.
