#!/usr/bin/env python3
"""Generate the two built-in ID card templates (front + back, CR80) -> presets.json.
Backgrounds are simple generated artwork; replace them with the original card art
in the app (Templates > Edit) when it is available. No personal data is included."""
import base64, io, json, os
from PIL import Image, ImageDraw, ImageFont
W, H = 1012, 638            # 3.375 x 2.125 in @ 300 dpi
AR = H / W
FD = "/usr/share/fonts/truetype/dejavu/"
def F(sz, bold=False, serif=False):
    n = ("DejaVuSerif" if serif else "DejaVuSans") + ("-Bold" if bold else "") + ".ttf"
    return ImageFont.truetype(FD + n, sz)
NAVY, RED, BLUE, INK, GRAY = (22, 38, 90), (179, 32, 31), (43, 58, 158), (17, 17, 17), (85, 85, 85)

def px(pct_x, pct_y): return int(W * pct_x / 100), int(H * pct_y / 100)
def text(d, xy, s, f, fill=INK, anchor="la"): d.text(xy, s, font=f, fill=fill, anchor=anchor)
def fit(s, bold, maxw, start, serif=False):
    sz = start
    while sz > 10 and F(sz, bold, serif).getlength(s) > maxw: sz -= 1
    return F(sz, bold, serif)

def paper(bands):
    im = Image.new("RGB", (W, H), (250, 247, 238)); d = ImageDraw.Draw(im)
    for y0, y1, col in bands: d.rectangle([0, int(H*y0/100), W, int(H*y1/100)], fill=col)
    return im, d

def flag(d, x, y, w, h):
    sh = h / 8.0
    for i in range(8):
        col = [(255,255,255),(200,30,45),(255,255,255),(40,55,140)][i % 4] if False else [(255,255,255),(200,30,45),(40,55,140)][[0,1,2,0,1,2,0,1][i]]
        d.rectangle([x, y+i*sh, x+w, y+(i+1)*sh], fill=col)
    ux, uh = w*0.42, h*0.5
    d.rectangle([x, y, x+ux, y+uh], fill=(40,55,140))
    d.line([x, y, x+ux, y+uh], fill=(255,255,255), width=9); d.line([x, y+uh, x+ux, y], fill=(255,255,255), width=9)
    d.line([x, y, x+ux, y+uh], fill=(200,30,45), width=4); d.line([x, y+uh, x+ux, y], fill=(200,30,45), width=4)
    d.rectangle([x+ux/2-6, y, x+ux/2+6, y+uh], fill=(255,255,255)); d.rectangle([x, y+uh/2-6, x+ux, y+uh/2+6], fill=(255,255,255))
    d.rectangle([x+ux/2-3, y, x+ux/2+3, y+uh], fill=(200,30,45)); d.rectangle([x, y+uh/2-3, x+ux, y+uh/2+3], fill=(200,30,45))

def label_row(d, xs, labels, y):
    for x, l in zip(xs, labels): text(d, px(x, y), l, F(24), GRAY)

def op_front():
    im, d = paper([(0, 21, (232, 236, 246)), (21, 32, (246, 233, 233))])
    text(d, (W//2, int(H*.065)), "HAWAIIAN KINGDOM", fit("HAWAIIAN KINGDOM", True, W-60, 74, True), (70, 60, 50), "mm")
    text(d, (W//2, int(H*.165)), "MOTOR VEHICLE OPERATORS CERTIFICATE", fit("MOTOR VEHICLE OPERATORS CERTIFICATE", True, W-60, 40), BLUE, "mm")
    for yy, l in [(25.6, "ID No."), (33.6, "ISS:"), (41.6, "Exp:")]: text(d, px(33.5, yy), l, F(34, True), RED if l == "Exp:" else INK, "lm")
    label_row(d, [33.5, 43.5, 52.5, 61.5, 71, 80], ["Height", "Weight", "Hair", "Eyes", "Sex", "Island"], 47.5)
    label_row(d, [33.5, 43.5], ["Class", "Restriction"], 60.5)
    text(d, px(3.5, 72.5), "DOB", F(28, True), INK, "lm")
    text(d, (W//2, int(H*.935)), "HAWAIIAN ARCHIPELAGO   ARCHIPELAEGIC STATE", F(15), GRAY, "mm")
    text(d, (W//2, int(H*.885)), "HAWAIIAN KINGDOM, KO HAWAIʻI PAE ʻAINA", fit("HAWAIIAN KINGDOM, KO HAWAIʻI PAE ʻAINA", True, W-60, 38), BLUE, "mm")
    return im

def op_back():
    im, d = paper([(0, 14, (232, 236, 246)), (14, 20, (246, 233, 233))])
    d.rectangle([0, int(H*.21), W, int(H*.47)], fill=(28, 28, 30))
    text(d, (W//2, int(H*.095)), "KO HAWAIʻI PAE ʻAINA", fit("KO HAWAIʻI PAE ʻAINA", True, W-80, 64), BLUE, "mm")
    text(d, (W//2, int(H*.515)), "GOVERNMENT PROPERTY KHPA", fit("GOVERNMENT PROPERTY KHPA", True, W-100, 50), INK, "mm")
    text(d, (W//2, int(H*.585)), "The person identified on this certificate is authorized to operate", F(22), INK, "mm")
    text(d, (W//2, int(H*.627)), "these class of vehicles in the HAWAIIAN KINGDOM.", F(22), INK, "mm")
    text(d, px(3.5, 72), "CLASS:", F(26), GRAY, "lm")
    text(d, px(3.5, 91), "ENDORSEMENT:", F(26), GRAY, "lm")
    return im

def id_front():
    im, d = paper([(0, 21, (236, 240, 232))])
    # ocean wash, lower right
    ov = Image.new("RGB", (W, H), (60, 130, 190)); mask = Image.new("L", (W, H), 0); md = ImageDraw.Draw(mask)
    for i in range(0, 300): md.ellipse([W*0.45-i*1.4, H*0.45-i*0.9, W+i*2, H+i*2], fill=int(120*(1-i/300)))
    im.paste(ov, (0, 0), mask); d = ImageDraw.Draw(im)
    text(d, (W//2, int(H*.075)), "HAWAIIAN KINGDOM", fit("HAWAIIAN KINGDOM", True, W-60, 76), (70, 60, 50), "mm")
    text(d, (W//2, int(H*.175)), "IDENTIFICATION CERTIFICATE", fit("IDENTIFICATION CERTIFICATE", True, W-60, 42), BLUE, "mm")
    flag(d, *px(70.5, 25), int(W*.285), int(H*.22))
    for yy, l in [(27.5, "ID No."), (34.5, "ISS:"), (41.5, "EXP:"), (48.5, "DOB:")]: text(d, px(36, yy), l, F(30, True), RED if l == "EXP:" else INK, "lm")
    label_row(d, [36, 45.5, 55.5, 64.5, 75, 86], ["Height", "Weight", "Hair", "Eyes", "Gender", "Island"], 52)
    text(d, (W//2, int(H*.915)), "HAWAIIAN KINGDOM, KO HAWAIʻI PAE ʻAINA", fit("HAWAIIAN KINGDOM, KO HAWAIʻI PAE ʻAINA", True, W-60, 36), INK, "mm")
    return im

def id_back():
    im, d = paper([])
    text(d, (W//2, int(H*.31)), "KO HAWAIʻI PAE ʻAINA", fit("KO HAWAIʻI PAE ʻAINA", True, W-80, 60), BLUE, "mm")
    text(d, (W//2, int(H*.66)), "The person identified herein is a resident of the Hawaiian", F(23, True), INK, "mm")
    text(d, (W//2, int(H*.705)), "Islands and subject to it's laws as set forth below.", F(23, True), INK, "mm")
    body = ["All persons born within the jurisdiction of this Kingdom, whether of alien foreigners, of naturalized or",
            "native parents, and all persons born abroad of a parent native of this Kingdom and afterwards",
            "coming to reside in this, shall be deemed to owe native allegiance to His Majesty. All such persons",
            "shall be amenable to the laws of this Kingdom as native Subjects. All persons born abroad of foreign",
            "parents shall, unless duly naturalized as in this article prescribed, be deemed aliens and treated as",
            "such pursuant to the laws. Statute laws 1845 Vol.I, 2nd Act, Ch.V, Art I, Sect.III"]
    for i, ln in enumerate(body): text(d, (W//2, int(H*(.775 + i*.0425))), ln, fit(ln, False, W-70, 17), INK, "mm")
    return im

def uri(im):
    b = io.BytesIO(); im.save(b, "JPEG", quality=84, optimize=True)
    return "data:image/jpeg;base64," + base64.b64encode(b.getvalue()).decode()

def f(k, l, x, y, w, s=9, a="left", t="text", src="", **kw):
    o = dict(k=k, l=l, t=t, x=x, y=y, w=w, s=s, a=a, src=src); o.update(kw); return o

OPF = [
 f("photo", "Photo", 3.5, 21.5, 27.5, t="photo", h=49),
 f("idno", "ID No.", 47.5, 22.4, 49, 9, b=1),
 f("iss", "Date issued", 46, 30.4, 50, 9, t="date", b=1),
 f("exp", "Expiration", 46, 38.4, 50, 9, t="date", b=1, c="red"),
 f("hgt", "Height", 33.5, 54.6, 9, 7, src="hgt2", b=1), f("wgt", "Weight", 43.5, 54.6, 8, 7, src="weight", b=1),
 f("hair", "Hair", 54.6, 54.6, 8, 7, src="hair", b=1, u=1), f("eyes", "Eyes", 61.5, 54.6, 8, 7, src="eyec", b=1, u=1),
 f("sex", "Sex (K / W)", 71, 54.6, 6, 7, b=1, u=1), f("isl", "Island", 80, 54.6, 18, 7, b=1, u=1, **{"def": "Hawaii"}),
 f("cls", "Class", 33.5, 66.2, 8, 7, b=1), f("rst", "Restriction", 43.5, 66.2, 20, 7, b=1),
 f("sig", "Signature", 58, 55, 36, t="sign", h=17),
 f("dob", "Date of birth", 13, 71.2, 40, 7, t="date", b=1, src="dob"),
 f("name", "Name (Last, First Middle)", 3.5, 76.3, 93, 8, b=1, src="lastfirst"),
 f("addr", "Address", 3.5, 82.2, 93, 6, src="addr"),
]
OPB = [
 f("clsd", "Class description", 24, 67.5, 74, 4.6, t="area", **{"def": "(2) MOTORCYCLE AND MOTORSCOOTER.\n(3) PASSENGER VEHICLES OF ANY GVWR. BUSSES DESIGNED TO TRANSPORT FIFTEEN OR FEWER OCCUPANTS. TRUCKS AND VANS WITH 15,000 LBS GVWR OR LESS."}),
 f("end", "Endorsement", 33, 87.5, 62, 6, b=1),
]
IDF = [
 f("photo", "Photo", 5, 26, 30, t="photo", h=48),
 f("idno", "ID No.", 49, 24.6, 47, 9, b=1),
 f("iss", "Date issued", 47, 31.6, 27, 9, t="date", b=1),
 f("exp", "Expiration", 47, 38.6, 27, 9, t="date", b=1, c="red"),
 f("dob", "Date of birth", 47, 45.6, 27, 9, t="date", b=1, src="dob"),
 f("hgt", "Height", 36, 56.5, 9, 7, src="hgt2", b=1), f("wgt", "Weight", 45.5, 56.5, 8, 7, src="weight", b=1),
 f("hair", "Hair", 55.5, 56.5, 8, 7, src="hair", b=1, u=1), f("eyes", "Eyes", 64.5, 56.5, 8, 7, src="eyec", b=1, u=1),
 f("sex", "Gender (K / W)", 75, 56.5, 6, 7, b=1, u=1), f("isl", "Island", 86, 56.5, 13, 6.5, b=1, u=1, **{"def": "Hawaii"}),
 f("name", "Name (Last, First Middle)", 5, 76, 90, 8, b=1, src="lastfirst"),
 f("addr", "Address", 5, 82.2, 90, 6, src="addr"),
]
IDB = [
 f("bar", "Barcode (ID number)", 5, 4.5, 90, t="bar", h=11),
 f("name", "Name", 4, 17.2, 49, 6.5, a="right", src="lastfirst", c="gray"),
 f("idno", "ID No.", 54.5, 17.2, 40, 6.5, c="gray"),
 f("sig", "Signature", 27, 40, 46, t="sign", h=17),
 f("orig", "Origin line (optional)", 5, 58.5, 90, 7, a="center", b=1, c="red"),
]
# the barcode encodes the same ID number the front shows
IDB[0]["k"] = "idno"; IDB[0]["t"] = "bar"; IDB[2]["k"] = "idno"
def fix(fs):
    for x in fs:
        x["def"] = x.get("def", "") ; x.pop("def_", None)
    return fs
out = []
for nid, name, fr, bk, ff, bf in [
    ("card-opid", "Motor Vehicle Operators Certificate (ID card, 2 sides)", op_front(), op_back(), OPF, OPB),
    ("card-id", "Identification Certificate (ID card, 2 sides)", id_front(), id_back(), IDF, IDB)]:
    out.append({"template": {"id": nid, "name": name, "ar": round(AR, 4), "pw": 3.375, "fields": fix(ff), "bfields": fix(bf), "updated": 0},
                "image": uri(fr), "backImage": uri(bk)})
json.dump(out, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "presets.json"), "w"), ensure_ascii=False)
if os.environ.get("PREVIEW"):
    for n, im in [("op_f", op_front()), ("op_b", op_back()), ("id_f", id_front()), ("id_b", id_back())]: im.save(os.environ["PREVIEW"] + "/" + n + ".png")
print("presets.json", os.path.getsize("presets.json") // 1024, "KB")
