KHPA FORMS — setup
===================
Files: index.html (the whole app), manifest.json, sw.js, icon-*.png.
Keep them together in one folder.

QUICK START — PC / Mac (no setup)
  Double-click index.html. Works offline. Fill in, then Print.
  Note: some browsers don't keep saved records for files opened this way.
  If you see a yellow warning bar, use Backup, or use the install method below.

BEST — install as an app on PC, Mac AND iPad (saves records reliably, works offline)
  1. Upload this whole folder to any web address you control
     (for example the GitHub Pages backup for khpa.io, in a folder such as /forms/).
     The app contains no customer data; records stay on each device.
  2. PC/Mac (Chrome or Edge): open the address, click the install icon in the address bar.
  3. iPad (Safari): open the address, tap Share, then "Add to Home Screen".
  It then opens from its own icon, full screen, even with no internet.

PRINTING
  Print button → Letter paper, one page, portrait. On iPad this uses AirPrint.
  The page is set up so no browser date/URL header or footer prints, and the watermark, boxes
  and colors print even if "Background graphics" is off. Scale: leave at 100% / Actual size.
  To keep a PDF copy: choose "Save as PDF" in the print window (on iPad: pinch the preview open, then Share).

BACKUP (important)
  Records are stored on the device you use. Use Backup now and then; it saves a .json file.
  Restore merges a backup into another device (move records PC <-> iPad).

CHANGING THINGS
  Settings (in the app): weight tariff rate, and the office address printed in item 7.
  Fixed wording and layout: template.html → renderMVC().
  More certificate types: add to DOCS in template.html, then run: python3 build.py
  When you change any file, raise CACHE in sw.js (khpa-forms-v2, v3 …) so devices update.
