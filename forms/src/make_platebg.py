#!/usr/bin/env python3
"""Plate backgrounds: the archipelago art with ONE island recolored per island code -> platebg.json.
Usage: make_platebg.py <green-archipelago.png>   (source art is not stored in the repo)"""
import sys, io, json, base64, os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
src = sys.argv[1] if len(sys.argv) > 1 else "archipelago_green.png"
g = Image.open(src).convert("RGB"); G = np.asarray(g).astype(float) / 255
hsv = np.asarray(g.convert("HSV")).astype(float); h = hsv[..., 0] * 360 / 255; s = hsv[..., 1] / 255; v = hsv[..., 2] / 255
Hh, Ww = h.shape; yy, xx = np.mgrid[0:Hh, 0:Ww]
land = (h > 45) & (h < 150) & (s > .30) & (v > .15) & (v < .9)
def box(x0, x1, y0, y1): return (xx >= x0) & (xx <= x1) & (yy >= y0) & (yy <= y1)
# code: (region, hue, saturation floor)
R = {"HAW": (box(1445, 1760, 525, 850), 357, .8), "MAU": (box(1235, 1455, 430, 565) & ~box(0, 1318, 522, 700), 335, .8),
     "OAH": (box(938, 1090, 325, 450), 40, .8), "KAU": (box(768, 912, 278, 386), 280, .75), "NII": (box(698, 768, 276, 314), 230, .28),
     "MOL": (box(1092, 1278, 372, 452), 100, 1.0), "LAN": (box(1118, 1232, 452, 542), 28, .85)}
out = {}
for code, (m, hue, sf) in R.items():
    sel = m & land
    lab, n = ndi.label(sel)
    if n == 0: raise SystemExit("no land found for " + code)
    sz = ndi.sum(sel, lab, range(1, n + 1)); big = lab == (1 + int(np.argmax(sz)))
    sel = ndi.binary_fill_holes(ndi.binary_closing(big, iterations=4)) & (v < .97)
    nh = np.full_like(h, hue / 360); ns = np.clip(np.maximum(s, sf), 0, 1); nv = np.clip(v * 1.3 + .05, 0, 1)
    if code == 'NII': ns = np.full_like(s, .22)
    if code == 'NII': nv = np.clip(v * .6 + .55, 0, 1)
    if code == 'MOL': nv = np.clip(v * 1.6 + .08, 0, 1)
    i = np.floor(nh * 6) % 6; f = nh * 6 - np.floor(nh * 6); p = nv * (1 - ns); q = nv * (1 - f * ns); t = nv * (1 - (1 - f) * ns)
    cs = [i == k for k in range(6)]
    res = np.stack([np.select(cs, [nv, q, p, p, t, nv]), np.select(cs, [t, nv, nv, q, p, p]), np.select(cs, [p, p, t, nv, nv, q])], -1)
    im = Image.fromarray((np.where(sel[..., None], res, G) * 255).astype("uint8")).resize((1000, 500), Image.LANCZOS)
    arr = np.asarray(im).copy(); arr[arr.min(axis=2) > 238] = 255; im = Image.fromarray(arr)
    b = io.BytesIO(); im.save(b, "JPEG", quality=80, optimize=True)
    out[code] = "data:image/jpeg;base64," + base64.b64encode(b.getvalue()).decode()
    if os.environ.get("PREVIEW"): im.save(os.environ["PREVIEW"] + "/bg_" + code + ".png")
json.dump(out, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "platebg.json"), "w"))
print("platebg.json", os.path.getsize("platebg.json") // 1024, "KB")
