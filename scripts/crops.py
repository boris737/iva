"""Cut Iva's renders and drawings out of the portfolio spreads (source/spreads, 2000x1329).

Run: python3 -I scripts/crops.py   -> writes src/assets/work/<name>.png
Boxes are (left, top, right, bottom) in spread pixels, inset to avoid rounded corners and book gutters.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / "source/spreads", ROOT / "src/assets/work"

CROPS = {
    # Aura Theatre
    "aura-aerial":      ("06", (1024, 365, 1849, 961)),
    "aura-red":         ("07", (1362, 712, 1838, 948)),
    "aura-siteplan":    ("07", (1588, 386, 1840, 680)),
    "aura-plans":       ("07", (160, 392, 930, 940)),
    "aura-axo":         ("06", (215, 745, 492, 945)),
    "aura-exploded":    ("08", (730, 368, 985, 690)),
    "aura-pano-1":      ("08", (1412, 394, 1830, 538)),
    "aura-pano-2":      ("08", (1412, 590, 1830, 736)),
    "aura-pano-3":      ("08", (1412, 786, 1830, 933)),
    "aura-auditorium":  ("08", (1040, 392, 1210, 545)),
    "aura-detail":      ("08", (168, 798, 500, 948)),
    "aura-section":     ("08", (735, 760, 966, 950)),
    # XMall
    "xmall-aerial":     ("03", (1002, 364, 1840, 963)),
    "xmall-tower":      ("04", (670, 364, 954, 963)),
    "xmall-plans":      ("04", (125, 615, 640, 965)),
    "xmall-drawings":   ("04", (1005, 375, 1850, 910)),
    "xmall-elev":       ("05", (140, 390, 555, 615)),
    "xmall-programme":  ("05", (140, 705, 355, 960)),
    "xmall-axo":        ("03", (150, 690, 432, 940)),
    # Health Center
    "health-aerial":    ("09", (1026, 367, 1864, 960)),
    "health-plans":     ("10", (150, 385, 640, 940)),
    "health-sections":  ("10", (1445, 435, 1825, 910)),
    "health-cutaway":   ("10", (1040, 762, 1380, 952)),
    "health-site":      ("10", (648, 762, 992, 952)),
    "health-axo":       ("09", (600, 630, 935, 950)),
    # Public Building
    "public-render":    ("11", (1060, 385, 1850, 940)),
    "public-site":      ("11", (152, 678, 590, 948)),
    "public-section":   ("12", (162, 792, 736, 955)),
    "public-elev":      ("12", (1046, 375, 1380, 748)),
    "public-plans":     ("12", (1400, 362, 1835, 765)),
    "public-interiors": ("12", (738, 370, 970, 752)),
    "public-tower":     ("12", (1044, 792, 1232, 955)),
    "public-front":     ("12", (760, 792, 968, 955)),
    # Quiet Sailing
    "sail-aerial":      ("13", (1032, 365, 1864, 796)),
    "sail-gallery":     ("18", (147, 420, 965, 933)),
    "sail-fire":        ("18", (1031, 420, 1851, 822)),
    "sail-sketch-fish": ("14", (1032, 452, 1378, 633)),
    "sail-sketch-museum": ("14", (1029, 704, 1379, 882)),
    "sail-sketch-marina": ("14", (1462, 692, 1805, 875)),
    "sail-sketch-restaurant": ("14", (1458, 470, 1785, 635)),
    "sail-boats":       ("15", (1016, 430, 1850, 750)),
    "sail-site":        ("13", (585, 368, 966, 636)),
    "sail-plans":       ("17", (150, 410, 935, 720)),
    "sail-sections":    ("17", (1025, 420, 1855, 960)),
    "sail-programme":   ("14", (528, 455, 960, 935)),
    "sail-daylight":    ("15", (430, 425, 970, 715)),
    # Cover
    "cover-sketch":     ("01", (600, 640, 1175, 975)),
}

if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for name, (sheet, box) in CROPS.items():
        Image.open(SRC / f"{sheet}.png").convert("RGB").crop(box).save(OUT / f"{name}.png")
    print(f"{len(CROPS)} crops -> {OUT}")
