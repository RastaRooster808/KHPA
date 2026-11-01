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

SCAN A STATE ID (carry details over to the Kingdom form)
  Needs a 2D barcode scanner that reads PDF417 (the barcode on the BACK of a state driver license / ID)
  and is set to USB keyboard mode (HID). Plug in, tap "Scan state ID", click the box, scan the back of the card.
  The app shows what it found; tap "Fill the form". The barcode text is never saved, only the filled fields.
  Registered Motor Vehicle Certificate: fills owner name, street and city.
  Your own templates: in the Template maker, pick "Fill from state ID scan" for each field (name, date of birth,
  address, sex, height, eye color ...). A template with no such fields has no Scan button.
  Check spelling after a scan: state IDs are all capitals and have no ʻokina.
  Get the person's OK before scanning. Do not scan IDs you have no reason to handle.

MERCHANDISE AND SERVICES LICENSE (built in, landscape)
  Pick it in the document list. Fill in License No., Company, Issue Date, Valid To, Business Activity.
  Print: Letter, LANDSCAPE, 100%, one page. Works on plain paper or on your border stock.
  Chrome/Edge pick landscape automatically; on iPad choose landscape in the print options if it does not.
  Fixed wording and positions were measured from your printed sample. Fonts: if Old English Text MT,
  Edwardian Script ITC, Monotype Corsiva or Apple Chancery are installed they are used; otherwise a
  built-in blackletter and the computer's script font are used, sized to the original widths.
  Settings > Emblem picture: add the faint crown-and-star picture (PNG with transparent background is best).
  Settings > Shift print right/down: nudge everything after a test print on your stock.

ADDING MORE FORMS (no coding)
  1. Tap Templates, then Add new template (or pick "+ Add new template" in the document list).
  2. Choose a picture of the blank form (JPG/PNG; for a PDF, screenshot or export the page as a picture).
  3. Tap Add field, then tap the spot on the form where that detail should print. Name it.
     Drag to move; arrows fine-tune; set type (text, several lines, date, check mark), size and width.
  4. Name the template and Save. It now appears in the document list; fill in, Preview, Print.
  Printing: Letter, 100%, one page. Turn off "Print the form image too" to print only the typed
  details onto pre-printed paper. Do a test print and nudge fields until they line up.
  To send a template to another computer or iPad: Templates > Share file, email the small .json
  file, then on the other device Templates > Import template file. Backup also includes templates.
  Template files contain no customer data. Backup files DO contain customer data.

CHANGING THINGS
  Settings (in the app): weight tariff rate, and the office address printed in item 7.
  Fixed wording and layout: template.html → renderMVC().
  The Registered Motor Vehicle Certificate layout is fixed code: template.html → renderMVC(), then run: python3 build.py
  When you change any file, raise CACHE in sw.js (khpa-forms-v2 … v7) so devices update.

ID CARDS (two sides) AND LICENSE PLATES
- Two card documents are built in: Identification Certificate and Motor Vehicle Operators Certificate,
  front and back, printed at actual card size (3.375 x 2.125 in), two pages per card. For a plain printer,
  tick "Test print on a Letter page". Add the photo with "Choose or take photo", sign with "Draw signature".
  The Scan button fills name, birth date, address, height, weight, hair and eyes from a state ID.
  The card art is generated placeholder artwork: use Templates > Edit to swap in the original card pictures.
- License Plate: pick the plate type (Standard, Trailer or small Motorcycle plate) and the island (HAW, MAU, OAH, MOL, LAN, KAU, NII). The background is the archipelago art with that island colored (red Hawaiʻi, pink Maui, gold Oʻahu, purple Kauaʻi, etc.); the abbreviation, text color and
  coordinates change and the next free number in that island's series is filled in automatically.
  Color coding: island color lettering with that island highlighted (default), every island color-coded, or red lettering.
  Plates print at true size: 12 x 6 in (standard and trailer) or 7 x 4 in (motorcycle), numbers up to 3 digits.
  Tick "Print on a Letter page" for a scaled proof on an office printer.
  Plate layout: Stacked (code above number) or Parallel (code and number side by side).
  Every plate is filed as a record. First numbers per island are set in Settings (one per line, e.g. HAW=501).

ID CARD VERIFICATION QR CODE (khpa.io/e)
- ID card backs carry a QR code. Scanning it opens khpa.io/emergency.html, which shows the card as VERIFIED,
  EXPIRED or NOT VERIFIED, and any emergency contacts the holder added. KHPA keeps no online records.
- The QR is signed with the KHPA signing key. Import the key file once on each office device:
  Settings > ID cards > KHPA signing key. Keep that file private (do not email it around or post it).
  Without the key the card prints with no QR code. The key is never included in Backup files.
- The QR code uses the ID number, name and expiration fields. Fill those before printing.
